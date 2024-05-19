import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import { useEffect, useState } from "react";

import { IP_ALEX } from "../utils/constants";

const Humidities = () => {
  const [humidities, setHumidities] = useState<
    Array<{ id: number; value: number }>
  >([]);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const fetchHumidity = async () => {
      try {
        const response = await fetch(IP_ALEX);
        const text = await response.text().then((t) => t.trim());
        // console.log("Fetched Text:", text);

        // regex #barbod 🙌
        const numbers = text.match(/[\d.]+/g);
        if (numbers && numbers.length >= 2) {
          const humidity = parseFloat(numbers[1]);
          // console.log("Parsed Humidity:", humidity);
          return humidity;
        }
        return null;
      } catch (error) {
        console.error("Failed to fetch humidity:", error);
        return null;
      }
    };

    const interval = setInterval(async () => {
      const newHumidityValue = await fetchHumidity();
      if (newHumidityValue !== null && !isNaN(newHumidityValue)) {
        // non NaN
        const newHumidity = {
          id: counter,
          value: newHumidityValue,
        };

        setHumidities((prevTemps) => {
          const updatedTemps = [...prevTemps, newHumidity];
          return updatedTemps.length > 20
            ? updatedTemps.slice(1)
            : updatedTemps;
        });
        setCounter((prevCounter) => prevCounter + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [counter]);

  return (
    <div className="shadow-md p-6 bg-gradient-to-t xl:bg-gradient-to-bl from-[#1a1030] to-[#1e0151] rounded-md gap-6 flex flex-col w-full max-w-barbod-xl min-w-0">
      <h2 className="text-white font-semibold drop-shadow-[0_0_4px_#ff5da9] text-center">
        Humidity Reading (%)
      </h2>
      {humidities.length === 0 ? (
        <p className="text-white text-center font-medium">Loading...</p>
      ) : (
        <ResponsiveContainer width="100%" aspect={2}>
          <LineChart
            data={humidities}
            margin={{
              right: 33,
              left: 0,
            }}
          >
            <YAxis domain={[30, 100]} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#ff5da9"
              dot={false}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default Humidities;
