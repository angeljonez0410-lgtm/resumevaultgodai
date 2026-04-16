import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const SimpleModeContext = createContext();

export function SimpleModeProvider({ children }) {
  const [isSimpleMode, setIsSimpleMode] = useState(false);

  useEffect(() => {
    // Load from user preferences
    base44.auth.me().then(user => {
      if (user?.simple_mode) setIsSimpleMode(true);
    }).catch(() => {});
  }, []);

  const toggleSimpleMode = async () => {
    const newMode = !isSimpleMode;
    setIsSimpleMode(newMode);
    try {
      await base44.auth.updateMe({ simple_mode: newMode });
    } catch (err) {
      console.error('Failed to save simple mode preference:', err);
    }
  };

  return (
    <SimpleModeContext.Provider value={{ isSimpleMode, toggleSimpleMode }}>
      {children}
    </SimpleModeContext.Provider>
  );
}

export function useSimpleMode() {
  const context = useContext(SimpleModeContext);
  if (!context) throw new Error('useSimpleMode must be used within SimpleModeProvider');
  return context;
}