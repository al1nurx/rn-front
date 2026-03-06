import { api } from "@/src/lib/client";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { storage } from "@/src/lib/storage";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userInfo: {
    id: number;
    name: string;
    username?: string;
    email: string;
  };
  token: string;
}

export const useLogin = () => {
  return useMutation<LoginResponse, AxiosError, LoginRequest>({
    mutationFn: async (body: LoginRequest) => {
      const response = await api.post<LoginResponse>("/api/login", body);
      const data = response.data;

      if (data.token) {
        await storage.saveToken(data.token);
      }

      return data;
    },
  });
};
