import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export const useSignup = () => {
  return useMutation({
    mutationFn: async (data: {email: string, password: string}) => {
      const response = await axios.post("/api/auth/signup", data);
      return response.data;
    },
  });
};
