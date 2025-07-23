import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark' | 'system';

interface Colors {
  background: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryText: string;
  card: string;
  cardBorder: string;
}

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  colors: Colors;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const lightColors: Colors = {
  background: '#FFFFFF',
  surface: '#F9FAFB',
  border: '#E5E7EB',
  text: '#111827',
  textSecondary: '#6B7280',
  primary: '#2563EB',
  primaryText: '#FFFFFF',
  card: '#FFFFFF',
  cardBorder: '#E5E7EB',
};

const darkColors: Colors = {
  background: '#121212',
  surface: '#1E1E1E',
  border: '#333333',
  text: '#F9FAFB',
  textSecondary: '#AAAAAA',
  primary: '#4287f5',
  primaryText: '#FFFFFF',
  card: '#1E1E1E',
  cardBorder: '#333333',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>('system');
  
  const isDark = theme === 'system' 
    ? systemColorScheme === 'dark'
    : theme === 'dark';

  const colors = isDark ? darkColors : lightColors;

  const toggleTheme = () => {
    setTheme(current => {
      if (current === 'light') return 'dark';
      if (current === 'dark') return 'system';
      return 'light';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, colors, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}