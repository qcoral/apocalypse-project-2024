import React, { useEffect, useRef, useState } from "react";

interface RadarProps {
  points: { distance: number; angle: number }[];
  maxDistance: number;
}

const Radar: React.FC<RadarProps> = ({ points, maxDistance }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(180); // start from 180 degrees (directly left on the screen) --> for spinning line

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height; // full height --> half of the width
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight; // bottom of the semicircle
    const maxCanvasRadius = canvasHeight * 0.9; // adjust radius --> no overlap
    const scale = maxCanvasRadius / maxDistance;

    const drawRadar = () => {
      context.clearRect(0, 0, canvasWidth, canvasHeight);
      context.strokeStyle = "#3df574"; // green
      context.lineWidth = 2;

      // draw circle at center
      context.beginPath();
      // make green dot
      context.fillStyle = "#3df574"; // green
      context.arc(centerX, centerY - 15, 5, 0, 2 * Math.PI);
      context.fill();

      // back to white
      context.fillStyle = "#fff"; // white

      //
      //
      // draw the semicircle
      //
      //

      context.beginPath();

      // right side up
      context.arc(centerX, centerY - 15, maxCanvasRadius, 0, Math.PI, true);
      context.closePath();
      context.stroke();

      // draw 5 lines
      context.beginPath();
      for (let i = 1; i <= 5; i++) {
        // 6 different pizza slices
        const angleRadians = ((i * 30 + 180) * Math.PI) / 180;
        const x = centerX + maxCanvasRadius * Math.cos(angleRadians);
        const y = centerY - 15 + maxCanvasRadius * Math.sin(angleRadians); // subtracting --> margin barbod
        context.moveTo(centerX, centerY - 15);
        context.lineTo(x, y);
      }
      context.stroke();

      // draw the scanning line
      context.beginPath();
      const scanningAngleRadians = (angle * Math.PI) / 180;
      const scanningX =
        centerX + maxCanvasRadius * Math.cos(scanningAngleRadians);
      const scanningY =
        centerY - 15 + maxCanvasRadius * Math.sin(scanningAngleRadians); // subtracting --> margin barbod
      context.moveTo(centerX, centerY - 15);
      context.lineTo(scanningX, scanningY);
      context.strokeStyle = "#ff0000"; // red color for scanning line
      context.stroke();

      // draw points
      points.forEach((point) => {
        const angleRadians = (point.angle * -Math.PI) / 180; // why work lmfao? barbod?
        const x = centerX + point.distance * Math.cos(angleRadians) * scale;
        const y =
          centerY - 15 + point.distance * Math.sin(angleRadians) * scale; // subtracting --> margin barbod

        // dbg
        // draw line from center to point
        // context.beginPath();
        // context.moveTo(centerX, centerY - 15);
        // context.lineTo(x, y);
        // context.stroke();

        if (point.angle >= 0 || point.angle <= 180) {
          context.beginPath();
          context.arc(x, y, 4, 0, 2 * Math.PI); // draw point for each point
          context.fill();
        }
      });
    };

    const updateRadar = () => {
      setAngle((prevAngle) => {
        let newAngle = prevAngle + 2; // increase increment --> faster spin
        if (newAngle >= 360) {
          newAngle = 180; // reset angle to start from the left again
        }
        return newAngle;
      });
      requestAnimationFrame(drawRadar);
    };

    const interval = setInterval(updateRadar, 50); // bigger --> faster spin
    return () => clearInterval(interval);
  }, [points, maxDistance, angle]);

  return (
    <canvas
      className="rounded-md bg-black border border-white"
      ref={canvasRef}
      width="600"
      height="300"
    />
  );
};

export default Radar;
