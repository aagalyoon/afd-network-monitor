import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_CONFIG } from '@/config/api-config';

interface SettingsContextType {
  useMockData: boolean;
  toggleMockData: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize mock data setting from localStorage or API configuration
  const [useMockData, setUseMockData] = useState<boolean>(() => {
    // First check if localStorage has a saved setting
    const savedSetting = localStorage.getItem('useMockData');
    
    if (savedSetting !== null) {
      console.log(`[Settings] Using saved mock data setting from localStorage: ${savedSetting}`);
      return savedSetting === 'true';
    }
    
    // If no saved setting, use the default from API config
    const defaultUseMockData = API_CONFIG.FEATURES.USE_MOCK_DATA_DEFAULT;
    console.log(`[Settings] No saved setting. Using default from API config: ${defaultUseMockData}`);
    return defaultUseMockData;
  });

  // Update localStorage when setting changes
  useEffect(() => {
    localStorage.setItem('useMockData', useMockData.toString());
    console.log(`[Settings] Mock data setting changed to: ${useMockData}`);
  }, [useMockData]);

  // Toggle between mock data and real data
  const toggleMockData = () => {
    setUseMockData((prev) => {
      const newValue = !prev;
      console.log(`[Settings] Toggling mock data setting from ${prev} to ${newValue}`);
      return newValue;
    });
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