import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

const config = { timeout: 30000, withCredentials: true };

interface Credentials {
  username: string;
  password: string;
}

interface UserResponse {
  username: string;
  name: string;
  photo: string;
  id: number;
}

export const userApi = {
  me: () =>
    axios.get<UserResponse>(`${API}/user/me`, config).then((r) => r.data),

  login: (credentials: Credentials) =>
    axios.post(`${API}/auth/login`, credentials, config).then((r) => r.data),

  register: (credentials: Credentials) =>
    axios.post(`${API}/auth/register`, credentials, config).then((r) => r.data),

  logout: () =>
    axios.post(`${API}/auth/logout`, {}, config).then((r) => r.data),
};