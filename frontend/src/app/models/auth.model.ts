export interface ILoginPayload {
  username: string;
  password: string;
}

export interface IAuthResponse {
  token: string;
}

export interface IRegisterPayload {
  name: string;
  email: string;
  unitId: string;
  password: string;
}

export interface IRegisterResponse {
  message?: string;
}
