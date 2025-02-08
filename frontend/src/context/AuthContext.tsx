// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  signIn: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const signIn = async () => {
    try {
      console.log("Starting sign in process...");
      await new Promise(resolve => setTimeout(resolve, 0)); // Ensure state update
      setIsAuthenticated(true);
      console.log("Sign in complete, isAuthenticated:", true);
    } catch (error) {
      console.error("Error during sign in:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log("Starting sign out process...");
      await new Promise(resolve => setTimeout(resolve, 0));
      setIsAuthenticated(false);
      console.log("Sign out complete, isAuthenticated:", false);
    } catch (error) {
      console.error("Error during sign out:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};