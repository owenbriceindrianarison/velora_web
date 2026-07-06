export interface TokenPair {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

export interface User {
  user_id: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput extends LoginInput {}
