import { useState, useEffect, useCallback } from 'react';

type ColorScheme = {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
};

type SavedTheme = {
  name: string;
  scheme: ColorScheme;
  isDark: boolean;
};

// Default color schemes
export const defaultLightScheme: ColorScheme = {
  name: 'Default Light',
  primaryColor: 'hsl(221.2 83.2% 53.3%)',
  secondaryColor: 'hsl(210 40% 96.1%)',
  accentColor: 'hsl(210 40% 90%)',
  backgroundColor: 'hsl(0 0% 100%)',
  textColor: 'hsl(222.2 47.4% 11.2%)'
};

export const defaultDarkScheme: ColorScheme = {
  name: 'Default Dark',
  primaryColor: 'hsl(217.2 91.2% 59.8%)',
  secondaryColor: 'hsl(217.2 32.6% 17.5%)',
  accentColor: 'hsl(215.3 25% 26.7%)',
  backgroundColor: 'hsl(224 71% 4%)',
  textColor: 'hsl(210 40% 98%)'
};

export const presetThemes: SavedTheme[] = [
  { name: 'Classic Light', scheme: defaultLightScheme, isDark: false },
  { name: 'Classic Dark', scheme: defaultDarkScheme, isDark: true },
  { 
    name: 'Cyan', 
    scheme: {
      name: 'Cyan',
      primaryColor: 'hsl(189, 94%, 43%)',
      secondaryColor: 'hsl(186, 100%, 94%)',
      accentColor: 'hsl(187, 92%, 69%)',
      backgroundColor: 'hsl(0, 0%, 100%)',
      textColor: 'hsl(198, 40%, 15%)'
    },
    isDark: false
  },
  { 
    name: 'Sunset', 
    scheme: {
      name: 'Sunset',
      primaryColor: 'hsl(25, 95%, 53%)',
      secondaryColor: 'hsl(15, 50%, 96%)',
      accentColor: 'hsl(30, 100%, 80%)',
      backgroundColor: 'hsl(0, 0%, 100%)',
      textColor: 'hsl(20, 40%, 15%)'
    },
    isDark: false
  },
  { 
    name: 'Night Mode', 
    scheme: {
      name: 'Night Mode',
      primaryColor: 'hsl(265, 89%, 66%)',
      secondaryColor: 'hsl(268, 25%, 20%)',
      accentColor: 'hsl(280, 100%, 60%)',
      backgroundColor: 'hsl(260, 50%, 10%)',
      textColor: 'hsl(260, 30%, 95%)'
    },
    isDark: true
  }
];

const THEMES_STORAGE_KEY = 'datadrivesaurora-custom-themes';

export function useThemeCustomizer() {
  const [activeTheme, setActiveTheme] = useState<SavedTheme>(() => {
    const storedTheme = localStorage.getItem('datadrivesaurora-active-theme');
    return storedTheme ? JSON.parse(storedTheme) : presetThemes[0];
  });
  
  const [customThemes, setCustomThemes] = useState<SavedTheme[]>(() => {
    const storedThemes = localStorage.getItem(THEMES_STORAGE_KEY);
    return storedThemes ? JSON.parse(storedThemes) : [];
  });
  
  const [allThemes, setAllThemes] = useState<SavedTheme[]>([...presetThemes, ...customThemes]);
  
  // Update all themes whenever custom themes change
  useEffect(() => {
    setAllThemes([...presetThemes, ...customThemes]);
  }, [customThemes]);
  
  // Apply the theme to CSS variables when it changes
  useEffect(() => {
    const root = document.documentElement;
    const { scheme, isDark } = activeTheme;
    
    // Set theme type (light/dark)
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Apply color scheme
    root.style.setProperty('--primary', scheme.primaryColor);
    root.style.setProperty('--secondary', scheme.secondaryColor);
    root.style.setProperty('--accent', scheme.accentColor);
    root.style.setProperty('--background', scheme.backgroundColor);
    root.style.setProperty('--foreground', scheme.textColor);
    
    // Save active theme
    localStorage.setItem('datadrivesaurora-active-theme', JSON.stringify(activeTheme));
  }, [activeTheme]);
  
  // Save custom themes when they change
  useEffect(() => {
    localStorage.setItem(THEMES_STORAGE_KEY, JSON.stringify(customThemes));
  }, [customThemes]);
  
  const setTheme = useCallback((theme: SavedTheme) => {
    setActiveTheme(theme);
  }, []);
  
  const addCustomTheme = useCallback((theme: SavedTheme) => {
    setCustomThemes(prevThemes => [...prevThemes, theme]);
  }, []);
  
  const updateCustomTheme = useCallback((index: number, theme: SavedTheme) => {
    setCustomThemes(prevThemes => {
      const newThemes = [...prevThemes];
      newThemes[index] = theme;
      return newThemes;
    });
    
    // If the updated theme is active, update it as well
    if (activeTheme.name === theme.name) {
      setActiveTheme(theme);
    }
  }, [activeTheme.name]);
  
  const deleteCustomTheme = useCallback((themeName: string) => {
    setCustomThemes(prevThemes => prevThemes.filter(theme => theme.name !== themeName));
    
    // If the deleted theme is active, switch to default
    if (activeTheme.name === themeName) {
      setActiveTheme(presetThemes[0]);
    }
  }, [activeTheme.name]);
  
  return {
    activeTheme,
    customThemes,
    allThemes,
    presetThemes,
    setTheme,
    addCustomTheme,
    updateCustomTheme,
    deleteCustomTheme
  };
}
