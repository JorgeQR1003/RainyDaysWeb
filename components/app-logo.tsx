import Image from "next/image";

interface AppLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function AppLogo({ size = "md", className = "" }: AppLogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <Image
      src="/sun-logo.png"
      alt="Rainy Days"
      width={64}
      height={64}
      className={`object-contain ${sizeClasses[size]} ${className}`}
    />
  );
}
