export interface UserExtras {
  username: string;
  customCities: string[];
  selectedCity: string;
  loginTimestamp: number;
}

const STORAGE_KEY = "rainy_days_user";

export function saveUserExtras(user: UserExtras): void {
  const data = JSON.stringify(user);
  localStorage.setItem(STORAGE_KEY, data);
  sessionStorage.setItem(STORAGE_KEY, data);
}

export function removeUserExtras(): void {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}

export function getUserExtrasFromStorage(): UserExtras | null {
  const stored = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as UserExtras;
  } catch {
    removeUserExtras();
    return null;
  }
}

export function extendUserTimestamp(): void {
  const extras = getUserExtrasFromStorage();
  if (extras) {
    extras.loginTimestamp = Date.now();
    saveUserExtras(extras);
  }
}
