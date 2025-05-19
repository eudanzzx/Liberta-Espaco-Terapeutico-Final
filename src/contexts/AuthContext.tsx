
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define user type
interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  register: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    
    // Adiciona o usuário administrador padrão se ele ainda não existir
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const adminExists = users.some((user: any) => user.email === 'adm');
    
    if (!adminExists) {
      users.push({
        id: 'admin-default',
        email: 'adm',
        username: 'Administrador',
        password: '123'
      });
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Carrega credenciais salvas
    const savedCredentials = localStorage.getItem('savedCredentials');
    if (savedCredentials) {
      try {
        const { email, password } = JSON.parse(savedCredentials);
        login(email, password, true);
      } catch (error) {
        console.error('Failed to load saved credentials:', error);
        localStorage.removeItem('savedCredentials');
      }
    }
  }, []);

  // Register a new user
  const register = async (email: string, username: string, password: string): Promise<boolean> => {
    try {
      // Check if user already exists
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userExists = users.some((user: User) => user.email === email);
      
      if (userExists) {
        return false;
      }
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email,
        username,
      };
      
      // Store user in "database"
      users.push({...newUser, password});
      localStorage.setItem('users', JSON.stringify(users));
      
      // Set as current user
      setCurrentUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  // Login user
  const login = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((user: any) => user.email === email && user.password === password);
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        setCurrentUser(userWithoutPassword);
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        setIsAuthenticated(true);
        
        // Salvar credenciais, se rememberMe for verdadeiro
        if (rememberMe) {
          localStorage.setItem('savedCredentials', JSON.stringify({ email, password }));
        } else {
          localStorage.removeItem('savedCredentials');
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Logout user
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setIsAuthenticated(false);
    // Não removemos savedCredentials aqui para manter a funcionalidade "lembrar-me"
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
