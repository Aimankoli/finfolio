import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
  fullName?: string;
  email?: string;
  phone?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  signIn: () => void;
  signOut: () => void;
  updateUserProfile: (userData: Partial<User>) => void;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

// Create context with full initial state
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  signIn: () => {},
  signOut: () => {},
  updateUserProfile: () => {},
  updatePassword: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const signIn = () => {
    console.log("Updating isAuthenticated to true...");
    setIsAuthenticated(true);
    // Initialize with dummy user data
    setUser({
      fullName: "User",
      email: "user@example.com",
      phone: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
    });
  };

  const signOut = () => {
    console.log("Updating isAuthenticated to false...");
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateUserProfile = (userData: Partial<User>) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData,
    }));
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      // Here you would typically make an API call to update the password
      // For now, we'll simulate a successful password update
      console.log("Password update requested:", { currentPassword, newPassword });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // If the API call is successful, resolve the promise
      return Promise.resolve();
    } catch (error) {
      // If there's an error, reject the promise with the error
      console.error("Error updating password:", error);
      return Promise.reject(new Error("Failed to update password"));
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        isAuthenticated,
        user,
        signIn,
        signOut,
        updateUserProfile,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};