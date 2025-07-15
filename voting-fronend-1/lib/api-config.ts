export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  ENDPOINTS: {
    SEND_VERIFICATION: "/auth/send-verification",
    VERIFY_CODE: "/auth/verify",
    GET_ELECTIONS: "/elections",
    SUBMIT_VOTES: "/voting/submit",
    REGISTER_VOTER: "/auth/register",
  },
}

// API client with error handling
export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Network error" }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Authentication methods
  async sendVerification(data: { fullName: string; phoneNumber: string }) {
    return this.request(API_CONFIG.ENDPOINTS.SEND_VERIFICATION, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async verifyCode(data: { fullName: string; phoneNumber: string; verificationCode: string }) {
    return this.request(API_CONFIG.ENDPOINTS.VERIFY_CODE, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Election methods
  async getElections(token?: string) {
    return this.request(API_CONFIG.ENDPOINTS.GET_ELECTIONS, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  }

  async submitVotes(votes: Record<string, string>, token: string) {
    return this.request(API_CONFIG.ENDPOINTS.SUBMIT_VOTES, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ votes }),
    })
  }

  // Registration method
  async registerVoter(data: any) {
    return this.request(API_CONFIG.ENDPOINTS.REGISTER_VOTER, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }
}

export const apiClient = new ApiClient()
