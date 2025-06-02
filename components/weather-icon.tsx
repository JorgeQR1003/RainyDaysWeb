interface WeatherIconProps {
  weatherCode: number
  size?: "sm" | "md" | "lg"
  animated?: boolean
}

export function WeatherIcon({ weatherCode, size = "md" }: WeatherIconProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-32 h-32",
    lg: "w-48 h-48",
  }

  // Determine weather condition based on weather code
  const isCloudy = weatherCode === 2 || weatherCode === 3
  const isRainy = (weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)
  const isSnowy = weatherCode >= 71 && weatherCode <= 86
  const isThunderstorm = weatherCode >= 95

  return (
    <div className={`${sizeClasses[size]} mx-auto relative flex items-center justify-center`}>
      {/* Main Sun Logo - No Animation */}
      <img src="/sun-logo.png" alt="Weather" className="w-full h-full object-contain" />

      {/* Weather overlay effects */}
      {isRainy && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-4 bg-blue-400 rounded-full opacity-70 animate-bounce"
              style={{
                left: `${20 + i * 10}%`,
                top: `${10 + (i % 2) * 20}%`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      )}

      {isSnowy && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-80 animate-bounce"
              style={{
                left: `${15 + i * 8}%`,
                top: `${10 + (i % 3) * 15}%`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      )}

      {isCloudy && <div className="absolute top-2 right-2 w-6 h-4 bg-gray-300 rounded-full opacity-70"></div>}

      {isThunderstorm && (
        <div
          className="absolute top-4 left-4 w-2 h-4 bg-yellow-300 opacity-80 animate-pulse"
          style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
        ></div>
      )}
    </div>
  )
}
