#include "DHTesp.h"
#include <ArduinoJson.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>

#define basehumid 90.0

DHTesp dht;
WiFiServer server(80);

// Wi-Fi configuration
const char *ssid = "Shopify Guests";
const char *password = "welcome2shopify";

int motorpin = D4;

void caughtZombie(float temp, float humid, bool caught) {  // handles web backend
  Serial.println("Publishing page....");
  WiFiClient client = server.accept();

  String htmlPage = F("HTTP/1.1 200 OK\r\n"
                      "Access-Control-Allow-Origin: *\r\n"
                      "Content-Type: text/html\r\n"
                      "Connection: close\r\n"  // the connection will be closed after completion of the response
                      "Refresh: 5\r\n"         // refresh the page automatically every 5 sec
                      "\r\n"
                      "<!DOCTYPE HTML>"
                      "<html>");
  htmlPage += temp;
  htmlPage += F(" ");
  htmlPage += humid;
  htmlPage += F(" ");
  htmlPage += caught;
  htmlPage += F("</html>"
                "\r\n");

  // wait for a client (web browser) to connect
  if (client) {
    Serial.println("\n[Client connected]");
    while (client.connected()) {
      // read line by line what the client (web browser) is requesting
      if (client.available()) {
        String line = client.readStringUntil('\r');
        Serial.print(line);
        // wait for end of client's request, that is marked with an empty line
        if (line.length() == 1 && line[0] == '\n') {
          client.println(htmlPage);
          Serial.println("page delivered");
          break;
        }
      }
    }

    while (client.available()) {
      // but first, let client finish its request
      // that's diplomatic compliance to protocols
      // (and otherwise some clients may complain, like curl)
      // (that is an example, prefer using a proper webserver library)
      client.read();
    }

    // close the connection:
    client.stop();
    Serial.println("[Client disconnected]");
  }
}

void setup() {
  Serial.begin(9600);

  Serial.println();
  Serial.println("Status\tHumidity (%)\tTemperature (C)");
  String thisBoard = ARDUINO_BOARD;
  Serial.println(thisBoard);
  dht.setup(D2, DHTesp::DHT11);  // Connect DHT sensor to GPIO 17
  pinMode(D7, OUTPUT);
  pinMode(motorpin, OUTPUT);

  WiFi.begin(ssid, password);  // Connect to your WiFi router
  Serial.println("Connecting to WiFi");
  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(WiFi.localIP());
  server.begin();
}

void loop() {
  delay(dht.getMinimumSamplingPeriod());

  float humidity = dht.getHumidity();
  float temperature = dht.getTemperature();

  Serial.print(dht.getStatusString());
  Serial.print("\t");
  Serial.print(humidity, 1);
  Serial.print("\t\t");
  Serial.println(temperature, 1);
  if (humidity > basehumid) {
    Serial.println("dropping!");
    digitalWrite(motorpin, LOW);
    digitalWrite(D7, HIGH);
    caughtZombie(temperature, humidity, true);
  } else if (humidity < basehumid) {
    digitalWrite(motorpin, HIGH);
    digitalWrite(D7, LOW);
    caughtZombie(temperature, humidity, false);
  }
}
