import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  useMockData: boolean;
  toggleMockData: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize mock data setting from localStorage or default to true
  const [useMockData, setUseMockData] = useState<boolean>(() => {
    const savedSetting = localStorage.getItem('useMockData');
    
    if (savedSetting !== null) {
      return savedSetting === 'true';
    }
    
    // Default to using mock data
    return true;
  });

  // Update localStorage when setting changes
  useEffect(() => {
    localStorage.setItem('useMockData', useMockData.toString());
  }, [useMockData]);

  // Toggle between mock data and real data
  const toggleMockData = () => {
    setUseMockData((prev) => !prev);
  };

  return (
    <SettingsContext.Provider value={{ useMockData, toggleMockData }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 