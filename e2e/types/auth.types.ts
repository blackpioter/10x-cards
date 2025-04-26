export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginErrorState {
  type: "validation" | "api" | "network";
  message: string;
}
