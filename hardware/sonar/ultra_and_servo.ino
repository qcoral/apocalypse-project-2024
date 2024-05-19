#include <Servo.h>
#include <HCSR04.h>
#include <WiFi.h>


// Replace with your network credentials
const char* ssid = "Shopify Guests";
const char* password = "welcome2shopify";

// Set web server port number to 80
WiFiServer server(80);

// Variable to store the HTTP request
String header;

#define s1p 4  //pwm
// #define s2p 0 //pwm
#define ultraTrig 2  //out
#define ultraEcho 15   //in
#define buzzer 16

Servo sv1;
Servo sv2;
const int sonarAngleDelay = 10;
const int ultraDelay = 60;
const long timeoutTime = 2000;

HCSR04 hc(ultraTrig, ultraEcho);

void setup() {
  sv1.attach(s1p);
  // sv2.attach(s2p);
  sv1.write(0);
  // sv2.write(0);
  pinMode(buzzer, OUTPUT);
  Serial.begin(9600);
  delay(5000);

  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  // Print local IP address and start web server
  Serial.println("");
  Serial.println("WiFi connected.");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  server.begin();
}

signed long ultraPreviousMillis = millis();
signed long sonarPreviousMillis = millis();
int dist = hc.dist();
int sv1angle = 0;
WiFiClient client;

void web(int angle, int dist) {
}

void loop() {
  signed long currentMillis = millis();
  int temp_angle;
  // Serial.println(dist);

  if (sv1angle >= 181) {
    temp_angle = (180 - (sv1angle - 180));
  } else {
    temp_angle = (sv1angle);
  }




  // Serial.print(temp_angle);
  // Serial.print(" ");
  // Serial.println(dist);
  WiFiClient client = server.available();  // Listen for incoming clients

  while (client) {  // If a new client connects,
    // currentTime = millis();
    // previousTime = currentTime;
    Serial.println("New Client.");  // print a message out in the serial port
    String currentLine = "";        // make a String to hold incoming data from the client
    if (client.connected()) {       // loop while the client's connected
                                    // while (client.connected() && currentTime - previousTime <= timeoutTime) {  // loop while the client's connected
      // currentTime = millis();
      String htmlPage = F("HTTP/1.1 200 OK\r\n"
                          "Access-Control-Allow-Origin: *\r\n"
                          "Content-Type: text/html\r\n"
                          "Connection: close\r\n"  // the connection will be closed after completion of the response
                          "Refresh: 5\r\n"         // refresh the page automatically every 5 sec
                          "\r\n"
                          "<!DOCTYPE HTML>"
                          "<html>");
      htmlPage += temp_angle;
      htmlPage += F(" ");
      htmlPage += dist;
      // htmlPage += random(5,300);
      htmlPage += F("</html>"
                    "\r\n");
      Serial.print(htmlPage);
      client.println(htmlPage);
      // client.println("HTTP/1.1 200 OK\r\n",
      //                 "Access-Control-Allow-Origin: *\r\n",
      //                 "Content-Type: text/html\r\n",
      //                 "Connection: close\r\n" , // the connection will be closed after completion of the response
      //                 "Refresh: 5\r\n"   ,      // refresh the page automatically every 5 sec
      //                 "\r\n",
      //                 "<!DOCTYPE HTML>",
      //                 "<html>",
      //                 String(angle),
      //                 "<br>",
      //                 String(dist),
      //                 "</html>");
      Serial.println(WiFi.localIP());
      sv1.write(temp_angle);
      if ((dist != 0) && (dist <= 20)) {
        digitalWrite(buzzer,HIGH);
      } else {
        digitalWrite(buzzer,LOW);
      }
      if (currentMillis - sonarPreviousMillis >= sonarAngleDelay) {
        sonarPreviousMillis = currentMillis;
        sv1angle++;
      }
      if (sv1angle >= 360) { sv1angle = 0; }

      if (currentMillis - ultraPreviousMillis >= ultraDelay) {
        ultraPreviousMillis = currentMillis;
        dist = hc.dist();
      }

      while (client.available()) {
        client.read();
      }
      client.stop();
      Serial.println("Client disconnected.");
      Serial.println("");
      Serial.println(WiFi.localIP());
      // Clear the header variable
      header = "";
      // Close the connection
    }

    if (currentMillis - sonarPreviousMillis >= sonarAngleDelay) {
      sonarPreviousMillis = currentMillis;
      sv1angle++;
    }
    if (sv1angle >= 360) { sv1angle = 0; }

    if (currentMillis - ultraPreviousMillis >= ultraDelay) {
      ultraPreviousMillis = currentMillis;
      dist = hc.dist();
    }
  }}
