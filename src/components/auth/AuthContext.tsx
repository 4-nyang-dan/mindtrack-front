import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

type User = { userId: string; email: string; token: string };
type AuthContextType = { user: User | null; setUser: (u: User | null) => void; logout: () => void; };

const AuthContext = createContext<AuthContextType>({ user: null, setUser: () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("auth_user");
    if (raw) setUserState(JSON.parse(raw));
  }, []);

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) localStorage.setItem("auth_user", JSON.stringify(u));
    else localStorage.removeItem("auth_user");
  };

  const logout = () => setUser(null);

  return <AuthContext.Provider value={{ user, setUser, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
