import {createContext, Dispatch, SetStateAction} from "react";
import {User} from "@/core/interfaces/User";

export const UserContext = createContext<{ user: User | undefined, setUser: Dispatch<SetStateAction<User | undefined>>, isFetchingUser: boolean}>({
  user: undefined,
  setUser: () => {},
  isFetchingUser: true
});
