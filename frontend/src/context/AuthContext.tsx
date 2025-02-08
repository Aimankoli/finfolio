import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async () => {
    try {
      console.log("🔐 AuthContext: Starting sign in process...");
      setIsLoading(true);
      console.log("⌛ AuthContext: Current state:", { isAuthenticated, isLoading });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsAuthenticated(true);
      
      console.log("✅ AuthContext: Sign in complete, new state:", { 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      console.error("🚨 AuthContext: Error during sign in:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log("Starting sign out process...");
      setIsLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsAuthenticated(false);
      
      console.log("Sign out complete, isAuthenticated:", false);
    } catch (error) {
      console.error("Error during sign out:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};