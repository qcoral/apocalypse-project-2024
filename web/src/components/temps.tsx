import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import { useEffect, useState } from "react";

import { IP_ALEX } from "../utils/constants";

const Temperatures = () => {
  const [temperatures, setTemperatures] = useState<
    Array<{ id: number; value: number }>
  >([]);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const fetchTemperature = async () => {
      try {
        const response = await fetch(IP_ALEX);
        const text = await response.text().then((t) => t.trim());
        // console.log("Fetched Text:", text);

        // regex
        const numbers = text.match(/[\d.]+/g);
        if (numbers && numbers.length >= 1) {
          const temperature = parseFloat(numbers[0]); // first value
          // console.log("Parsed Temperature:", temperature);
          return temperature;
        }
        return null;
      } catch (error) {
        console.error("Failed to fetch temperature:", error);
        return null;
      }
    };

    const interval = setInterval(async () => {
      const newTempValue = await fetchTemperature();
      if (newTempValue !== null && !isNaN(newTempValue)) {
        // non NaN
        const newTemp = {
          id: counter,
          value: newTempValue,
        };

        setTemperatures((prevTemps) => {
          const updatedTemps = [...prevTemps, newTemp];
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
    <div className="shadow-md p-6 bg-gradient-to-b xl:bg-gradient-to-br from-[#1a1030] to-[#1e0151] rounded-md gap-6 flex flex-col w-full max-w-barbod-xl min-w-0">
      <h2 className="text-white font-semibold drop-shadow-[0_0_4px_#02adef] text-center">
        Live Temperature (°C)
      </h2>
      {temperatures.length === 0 ? (
        <p className="text-white text-center font-medium">Loading...</p>
      ) : (
        <ResponsiveContainer width="100%" aspect={2}>
          <LineChart
            data={temperatures}
            margin={{
              right: 33,
              left: 0,
            }}
          >
            <YAxis domain={[20, 30]} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#02adef"
              dot={false}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default Temperatures;
