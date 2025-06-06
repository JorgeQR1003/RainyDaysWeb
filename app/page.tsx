"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, MapPin, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeatherIcon } from "@/components/weather-icon";
import { CityManager } from "@/components/city-manager";
import {
  registerWithFirebase,
  loginWithFirebase,
  logoutFromFirebase,
  getCurrentFirebaseUser,
  startFirebaseAuthListener,
  updateAppUserExtras,
  type User as UserType,
} from "@/lib/firebaseAuth"; 
import {
  getCurrentWeather,
  getWeatherForecast,
  getMultipleCitiesWeather,
  type WeatherData,
  type ForecastDay,
} from "@/lib/weather-api";
import { AppLogo } from "@/components/app-logo";

const defaultCities = [
  "Mexicali",
  "Tijuana",
  "Madrid",
  "Beijing",
  "Buenos Aires",
];

export default function RainyDaysApp() {
  const [activeTab, setActiveTab] = useState("weather");
  const [name, setName] = useState("");         
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [citiesWeather, setCitiesWeather] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCityManager, setShowCityManager] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    startFirebaseAuthListener();

    (async () => {
      const firebaseUser = await getCurrentFirebaseUser();
      if (firebaseUser) {
        setUser(firebaseUser);
      }
    })();

    const handleUserStateChange = (e: CustomEvent<UserType | null>) => {
      setUser(e.detail);
    };
    window.addEventListener("userStateChanged", handleUserStateChange as EventListener);
    return () => {
      window.removeEventListener("userStateChanged", handleUserStateChange as EventListener);
    };
  }, []);

  const loadWeatherData = useCallback(
    async (selectedCityParam?: string) => {
      setLoading(true);
      setError(null);

      try {
        const selectedCity = selectedCityParam || user?.selectedCity || "Mexicali";
        const citiesToLoad = user?.customCities || defaultCities;

        const [weather, forecastData, citiesData] = await Promise.all([
          getCurrentWeather(selectedCity),
          getWeatherForecast(selectedCity),
          getMultipleCitiesWeather(citiesToLoad),
        ]);

        setCurrentWeather(weather);
        setForecast(forecastData);
        setCitiesWeather(citiesData);
      } catch (err) {
        setError("Error al cargar los datos del clima. Usando datos de ejemplo.");
        console.error("Weather API Error:", err);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    loadWeatherData();
  }, [loadWeatherData]);

  const handleLogin = async () => {
    setAuthError(null);
    if (!email.trim() || !password.trim()) {
      setAuthError("Por favor ingresa tu correo y contraseña");
      return;
    }
    const result = await loginWithFirebase(email, password);
    if (result) {
      setUser(result);
      setActiveTab("weather");
      setEmail("");
      setPassword("");
      setName("");
    } else {
      setAuthError("Credenciales inválidas");
    }
  };

  const handleRegister = async () => {
    setAuthError(null);
    if (!name.trim() || !email.trim() || !password.trim()) {
      setAuthError("Por favor ingresa tu nombre, correo y contraseña");
      return;
    }
    const result = await registerWithFirebase(name, email, password);
    if (result) {
      setUser(result);
      setActiveTab("weather");
      setName("");
      setEmail("");
      setPassword("");
      setIsRegistering(false);
    } else {
      setAuthError("No se pudo registrar. Revisa los datos.");
    }
  };

  const handleLogout = async () => {
    await logoutFromFirebase();
    setUser(null);
    setActiveTab("login");
    setName("");
    setEmail("");
    setPassword("");
  };

  const handleCityChange = (city: string) => {
    if (user) {
      const updatedUser = { ...user, selectedCity: city };
      updateAppUserExtras(updatedUser);
      setUser(updatedUser);
      loadWeatherData(city);
    }
  };

  const handleUserUpdate = (updatedUser: UserType) => {
    updateAppUserExtras(updatedUser);
    setUser(updatedUser);
    loadWeatherData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <header className="bg-blue-500 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-center mt-18">
          <div className="flex items-center gap-2">
            <AppLogo size="md" />
            <h1 className="text-xl font-semibold">Rainy Days</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {showCityManager && user && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md">
              <CityManager
                user={user}
                onUserUpdate={handleUserUpdate}
                onClose={() => setShowCityManager(false)}
              />
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="weather">Clima</TabsTrigger>
            <TabsTrigger value="climate">Ciudades</TabsTrigger>
            <TabsTrigger value="login">
              {user ? "Perfil" : isRegistering ? "Regístrate" : "Iniciar Sesión"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weather" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-8 text-center">
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                  ) : currentWeather ? (
                    <div className="mb-6">
                      <div className="mb-6">
                        <WeatherIcon
                          weatherCode={currentWeather.weatherCode}
                          size="lg"
                        />
                      </div>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <MapPin className="h-5 w-5 text-gray-600" />
                        <h2 className="text-3xl font-bold text-gray-800">
                          {currentWeather.city}, {currentWeather.country}
                        </h2>
                      </div>
                      <p className="text-lg text-gray-600 capitalize mb-4">
                        {currentWeather.description}
                      </p>
                      <p className="text-5xl font-bold text-blue-600 mb-4">
                        {currentWeather.temperature}°C
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>Humedad: {currentWeather.humidity}%</div>
                        <div>Viento: {currentWeather.windSpeed} m/s</div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      No hay datos del clima disponibles
                    </div>
                  )}

                  {currentWeather && (
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <Card className="bg-blue-50 border-2 border-blue-200">
                        <CardContent className="p-6 text-center">
                          <p className="text-blue-600 font-semibold text-lg mb-2">
                            Máxima
                          </p>
                          <p className="text-4xl font-bold text-gray-800">
                            {currentWeather.maxTemp}°
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-blue-50 border-2 border-blue-200">
                        <CardContent className="p-6 text-center">
                          <p className="text-blue-600 font-semibold text-lg mb-2">
                            Mínima
                          </p>
                          <p className="text-4xl font-bold text-gray-800">
                            {currentWeather.minTemp}°
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  <div className="mt-6">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      {user ? "Tus Ciudades:" : "Seleccionar Ciudad:"}
                    </Label>
                    <select
                      value={user?.selectedCity || "Mexicali"}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {(user?.customCities || defaultCities).map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    {user && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCityManager(true)}
                        className="mt-2 w-full"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Administrar Ciudades
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-800 text-center">
                    ESTA SEMANA
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-sm font-semibold text-gray-600 mb-4">
                        <div></div>
                        <div className="text-center">MÁX</div>
                        <div className="text-center">MÍN</div>
                      </div>
                      {forecast.map((day, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-3 gap-4 items-center py-2 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-800">{day.day}</div>
                          <div className="text-center">
                            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                              {day.maxTemp}°
                            </span>
                          </div>
                          <div className="text-center">
                            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                              {day.minTemp}°
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="climate" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-gray-800 text-center">
                  {user ? "TUS CIUDADES" : "CLIMA MUNDIAL"}
                </CardTitle>
                {user && (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowCityManager(true)}
                      className="mt-2"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Administrar Ciudades
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-8">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(citiesWeather || []).map((cityWeather, index) => (
                      <Card
                        key={index}
                        className="bg-blue-50 border-2 border-blue-200 hover:shadow-lg transition-shadow"
                      >
                        <CardContent className="p-6 text-center">
                          <h3 className="text-blue-600 font-bold text-xl mb-2">
                            {cityWeather.city}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize mb-4">
                            {cityWeather.description}
                          </p>
                          <p className="text-5xl font-bold text-gray-800 mb-2">
                            {cityWeather.temperature}°
                          </p>
                          <div className="text-sm text-gray-600">
                            <span className="text-red-500">
                              ↑{cityWeather.maxTemp}°
                            </span>
                            {" / "}
                            <span className="text-blue-500">
                              ↓{cityWeather.minTemp}°
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="login" className="space-y-6">
            <div className="max-w-md mx-auto">
              {user ? (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <AppLogo size="xl" className="mx-auto mb-4" />
                      <h2 className="text-3xl font-bold text-gray-800 mb-2 mt-4">
                        ¡Hola, {user.username}! 
                      </h2>
                      <p className="text-lg text-gray-600">Perfil y Configuración</p>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-2">Tus Ciudades</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Tienes {user.customCities.length} ciudades configuradas
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => setShowCityManager(true)}
                          className="w-full"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Administrar Ciudades
                        </Button>
                      </div>

                      <Button onClick={handleLogout} variant="destructive" className="w-full">
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar Sesión
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <AppLogo size="xl" className="mx-auto mb-4" />
                      <h2 className="text-3xl font-bold text-gray-800 mb-2 mt-4">
                        ¡Bienvenido!
                      </h2>
                      <p className="text-lg text-gray-600">
                        {isRegistering
                          ? "Crea tu cuenta"
                          : "Inicia sesión para personalizar tus ciudades"}
                      </p>
                    </div>

                    {authError && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {authError}
                      </div>
                    )}

                    <div className="space-y-6">
                      {isRegistering && (
                        <div>
                          <Label
                            htmlFor="name"
                            className="text-lg font-semibold text-gray-800 mb-2 block"
                          >
                            NOMBRE:
                          </Label>
                          <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-12 text-lg border-2 border-blue-200 focus:border-blue-400"
                            placeholder="Ingresa tu nombre"
                            onKeyPress={(e) =>
                              e.key === "Enter" && handleRegister()
                            }
                          />
                        </div>
                      )}
                      <div>
                        <Label
                          htmlFor="email"
                          className="text-lg font-semibold text-gray-800 mb-2 block"
                        >
                          CORREO ELECTRÓNICO:
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 text-lg border-2 border-blue-200 focus:border-blue-400"
                          placeholder="Ingresa tu correo"
                          onKeyPress={(e) =>
                            e.key === "Enter" && (isRegistering ? handleRegister() : handleLogin())
                          }
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="password"
                          className="text-lg font-semibold text-gray-800 mb-2 block"
                        >
                          CONTRASEÑA:
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12 text-lg border-2 border-blue-200 focus:border-blue-400"
                          placeholder="Ingresa tu contraseña"
                          onKeyPress={(e) =>
                            e.key === "Enter" && (isRegistering ? handleRegister() : handleLogin())
                          }
                        />
                      </div>
                      <Button
                        onClick={isRegistering ? handleRegister : handleLogin}
                        className="w-full h-12 text-lg bg-blue-500 hover:bg-blue-600"
                      >
                        {isRegistering ? "Registrarse" : "Iniciar Sesión"}
                      </Button>
                    </div>

                    <div className="mt-4 text-sm text-gray-500 text-center">
                      {isRegistering ? (
                        <p>
                          ¿Ya tienes cuenta?{" "}
                          <button
                            onClick={() => {
                              setIsRegistering(false);
                              setAuthError(null);
                              setName("");
                              setEmail("");
                              setPassword("");
                            }}
                            className="text-blue-600 hover:underline"
                          >
                            Inicia sesión
                          </button>
                        </p>
                      ) : (
                        <p>
                          ¿No tienes cuenta?{" "}
                          <button
                            onClick={() => {
                              setIsRegistering(true);
                              setAuthError(null);
                              setName("");
                              setEmail("");
                              setPassword("");
                            }}
                            className="text-blue-600 hover:underline"
                          >
                            Regístrate
                          </button>
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
