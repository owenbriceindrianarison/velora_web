export interface TokenPair {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface User {
  id: string
  email: string
  display_name: string
  created_at: string
}

export interface SessionUser {
  id: string
  email: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput extends LoginInput {
  display_name: string
}
