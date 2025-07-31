import { useQuery } from "@tanstack/react-query";
import axios from "../../axios";

export const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data } = await axios.get("/users/profile");
      return data?.result;
    }
  });
};
