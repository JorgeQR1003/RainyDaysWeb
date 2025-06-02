export interface User {
  username: string
  customCities: string[]
  selectedCity: string
  loginTimestamp: number
}

export class AuthService {
  private static readonly STORAGE_KEY = "rainy_days_user"
  private static readonly SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds

  static login(username: string, password: string): User | null {
    // Simple authentication - in a real app, this would be server-side
    if (username && password) {
      const user: User = {
        username,
        customCities: ["Mexicali", "Tijuana", "Madrid", "Beijing", "Buenos Aires"],
        selectedCity: "Mexicali",
        loginTimestamp: Date.now(),
      }

      // Store in both localStorage and sessionStorage for better persistence
      const userData = JSON.stringify(user)
      localStorage.setItem(this.STORAGE_KEY, userData)
      sessionStorage.setItem(this.STORAGE_KEY, userData)

      return user
    }
    return null
  }

  static logout(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    sessionStorage.removeItem(this.STORAGE_KEY)
  }

  static getCurrentUser(): User | null {
    if (typeof window === "undefined") return null

    // Try localStorage first, then sessionStorage
    let userData = localStorage.getItem(this.STORAGE_KEY)
    if (!userData) {
      userData = sessionStorage.getItem(this.STORAGE_KEY)
    }

    if (!userData) return null

    try {
      const user: User = JSON.parse(userData)

      // Check if session is still valid (30 days)
      if (Date.now() - user.loginTimestamp > this.SESSION_DURATION) {
        this.logout()
        return null
      }

      // Update timestamp to extend session
      user.loginTimestamp = Date.now()
      this.updateUser(user)

      return user
    } catch (error) {
      console.error("Error parsing user data:", error)
      this.logout()
      return null
    }
  }

  static updateUser(user: User): void {
    const userData = JSON.stringify(user)
    localStorage.setItem(this.STORAGE_KEY, userData)
    sessionStorage.setItem(this.STORAGE_KEY, userData)
  }

  static isLoggedIn(): boolean {
    return this.getCurrentUser() !== null
  }

  static extendSession(): void {
    const user = this.getCurrentUser()
    if (user) {
      user.loginTimestamp = Date.now()
      this.updateUser(user)
    }
  }

  // Auto-save user session periodically
  static startSessionMaintenance(): void {
    if (typeof window === "undefined") return

    // Extend session every 5 minutes if user is active
    setInterval(
      () => {
        if (this.isLoggedIn()) {
          this.extendSession()
        }
      },
      5 * 60 * 1000,
    ) // 5 minutes

    // Listen for page visibility changes to maintain session
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && this.isLoggedIn()) {
        this.extendSession()
      }
    })

    // Listen for storage changes in other tabs
    window.addEventListener("storage", (e) => {
      if (e.key === this.STORAGE_KEY) {
        // Trigger a re-check of user state
        window.dispatchEvent(new CustomEvent("userStateChanged"))
      }
    })
  }
}
