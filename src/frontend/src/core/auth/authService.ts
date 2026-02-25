import api from "../api/axios";

export async function loginRequest(username: string, password: string) {
  const response = await api.post("/api/auth/login/", {
    username,
    password,
  });

  return response.data;
}

export async function signupRequest(
  username: string,
  email: string,
  password: string,
  confirmPassword: string
) {
  const response = await api.post("/api/auth/signup/", {
    username,
    email,
    password,
    confirm_password: confirmPassword,
  });

  return response.data;
}