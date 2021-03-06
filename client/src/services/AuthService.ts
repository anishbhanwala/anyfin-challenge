import jwtDecoder from "jwt-decode";
import { User } from "../typings";

export const JWT_KEY = "ac_access_token";

export const isTokenExpired = (accessToken: string) => {
  try {
    const decoded: any = jwtDecoder(accessToken);
    return decoded.exp < Date.now() / 1000;
  } catch (err) {
    return false;
  }
};

const clearExpiredToken = () => {
  const accessToken = localStorage.getItem(JWT_KEY);
  if (accessToken && isTokenExpired(accessToken)) {
    removeAccessToken();
  }
};

export const loginUser = (accessToken: string) => {
  localStorage.setItem(JWT_KEY, accessToken);
};

export const getAccessToken = () => {
  clearExpiredToken();
  return localStorage.getItem(JWT_KEY);
};

export const removeAccessToken = () => {
  localStorage.removeItem(JWT_KEY);
};

export const getUser = (accessToken: string): User => {
  return jwtDecoder(accessToken);
};
