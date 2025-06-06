import Image from "next/image";

interface WeatherIconProps {
  weatherCode: number;
  size?: "sm" | "md" | "lg";
}

export function WeatherIcon({ weatherCode, size = "md" }: WeatherIconProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-32 h-32",
    lg: "w-48 h-48",
  };

  return (
    <div className={`${sizeClasses[size]} mx-auto flex items-center justify-center`}>
      <Image
        src="/sun-logo.png"
        alt="Weather"
        width={128}
        height={128}
        className="w-full h-full object-contain"
      />
    </div>
  );
}
