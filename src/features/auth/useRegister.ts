import { api } from "@/src/lib/client";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { storage } from "@/src/lib/storage";

export interface RegisterRequest {
  name: string;
  surname: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  userInfo: {
    id: number;
    name: string;
    surname: string;
    email: string;
  };
  token: string;
}

export const useRegister = () => {
  return useMutation<RegisterResponse, AxiosError, RegisterRequest>({
    mutationFn: async (body: RegisterRequest) => {
      const response = await api.post<RegisterResponse>("/api/register", body);
      const data = response.data;

      if (data.token) {
        await storage.saveToken(data.token);
      }

      return data;
    },
  });
};
