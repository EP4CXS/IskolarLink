import React, { useEffect, useState, createContext, useContext } from 'react';
import { User } from '../types';
import { useData } from './DataContext';
import { toast } from 'sonner';
import { apiGetUser, apiLogin, apiRegister } from '../lib/api';
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: {children: ReactNode;}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { users, addUser } = useData();
  // Initial restore from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem('iskolarlink_user_id');
    (async () => {
      try {
        if (storedUserId) {
          const fresh = await apiGetUser(storedUserId);
          setUser(fresh as any);
        }
      } catch {
        localStorage.removeItem('iskolarlink_user_id');
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Keep current user in sync when users array updates (profile edits)
  useEffect(() => {
    if (user) {
      const fresh = users.find((u) => u.id === user.id);
      if (fresh && fresh !== user) setUser(fresh);
    }
  }, [users]);
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const foundUser = await apiLogin(email, password);
      setUser(foundUser as any);
      localStorage.setItem('iskolarlink_user_id', foundUser.id);
      toast.success(`Welcome back, ${foundUser.name}!`);
    } finally {
      setIsLoading(false);
    }
  };
  const register = async (
  name: string,
  email: string,
  password: string)
  : Promise<User> => {
    setIsLoading(true);
    try {
      const newUser = await apiRegister(name, email, password);
      setUser(newUser as any);
      localStorage.setItem('iskolarlink_user_id', newUser.id);
      toast.success(`Welcome to IskolarLink, ${newUser.name}!`);
      return newUser as any;
    } finally {
      setIsLoading(false);
    }
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem('iskolarlink_user_id');
    toast.info('Logged out successfully');
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading
      }}>
      
      {children}
    </AuthContext.Provider>);

}
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined)
  throw new Error('useAuth must be used within an AuthProvider');
  return context;
};