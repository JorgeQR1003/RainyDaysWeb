"use client";
import { useEffect, useState } from "react";
import SplashScreen from "@/components/splash-screen";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return showSplash ? <SplashScreen /> : <>{children}</>;
}
