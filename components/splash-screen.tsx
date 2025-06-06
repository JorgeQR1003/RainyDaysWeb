"use client";

import { useEffect } from "react";
import { Cloud, CloudRain, Sun } from "lucide-react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {      
    }, 3000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 p-4 ${poppins.className}`}
    >
      <div className="flex flex-col items-center justify-center bg-white rounded-3xl p-8 shadow-lg w-full max-w-sm animate-fade-in">
        <div className="relative flex items-center justify-center mb-6">
          <Sun className="text-yellow-400 w-16 h-16 animate-pulse" />
          <Cloud className="text-blue-500 w-20 h-20 absolute -right-4 -bottom-2" />
          <CloudRain className="text-blue-700 w-12 h-12 absolute -left-2 -bottom-1" />
        </div>

        <h1 className="text-3xl font-bold text-blue-600 mb-2 text-center">
          RainyDay
        </h1>
        <p className="text-blue-500 text-center mb-6">
          Tu clima en tiempo real
        </p>

        <div className="flex justify-center items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full bg-blue-600 animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-3 h-3 rounded-full bg-blue-500 animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-3 h-3 rounded-full bg-blue-400 animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
