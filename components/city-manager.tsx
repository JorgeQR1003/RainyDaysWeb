"use client";

import { useState } from "react";
import { Plus, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAvailableCities } from "@/lib/weather-api";
import { type User } from "@/lib/firebaseAuth"; 
import { updateAppUserExtras } from "@/lib/firebaseAuth"; 

interface CityManagerProps {
  user: User;
  onUserUpdate: (user: User) => void;
  onClose: () => void;
}

export function CityManager({ user, onUserUpdate, onClose }: CityManagerProps) {
  const [newCity, setNewCity] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const availableCities = getAvailableCities();
  const filteredCities = availableCities.filter(
    (city) =>
      city.toLowerCase().includes(newCity.toLowerCase()) &&
      !user.customCities.includes(city)
  );

  const addCity = (cityName: string) => {
    if (
      cityName &&
      !user.customCities.includes(cityName) &&
      availableCities.includes(cityName)
    ) {
      const updatedUser: User = {
        ...user,
        customCities: [...user.customCities, cityName],
      };
      updateAppUserExtras(updatedUser);
      onUserUpdate(updatedUser);
      setNewCity("");
      setShowSuggestions(false);
    }
  };

  const removeCity = (cityName: string) => {
    if (user.customCities.length > 1) {
      const updatedUser: User = {
        ...user,
        customCities: user.customCities.filter((city) => city !== cityName),
        selectedCity:
          user.selectedCity === cityName ? user.customCities[0] : user.selectedCity,
      };
      updateAppUserExtras(updatedUser);
      onUserUpdate(updatedUser);
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Administrar Ciudades
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Agregar Nueva Ciudad
          </Label>
          <div className="relative">
            <div className="flex gap-2">
              <Input
                value={newCity}
                onChange={(e) => {
                  setNewCity(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Escribe el nombre de la ciudad..."
                className="flex-1"
              />
              <Button
                onClick={() => addCity(newCity)}
                disabled={!newCity || !availableCities.includes(newCity)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {showSuggestions && newCity && filteredCities.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {filteredCities.slice(0, 8).map((city) => (
                  <button
                    key={city}
                    onClick={() => addCity(city)}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Tus Ciudades</Label>
          <div className="space-y-2">
            {user.customCities.map((city) => (
              <div
                key={city}
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
              >
                <span className="font-medium text-gray-800">{city}</span>
                <div className="flex items-center gap-2">
                  {city === user.selectedCity && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                      Actual
                    </span>
                  )}
                  {user.customCities.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCity(city)}
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-sm text-gray-500">
          Puedes agregar ciudades de nuestra lista disponible. Tus ciudades seleccionadas
          aparecerán tanto en la sección de Clima como en la de Ciudades.
        </div>
      </CardContent>
    </Card>
  );
}
