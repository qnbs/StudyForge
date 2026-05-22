import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../lib/db';
import { decryptApiKey, encryptApiKey } from '../lib/crypto';

interface SecureConfigContextState {
  hasMasterPasswordSet: boolean;
  isUnlocked: boolean;
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
  setMasterPassword: (password: string) => Promise<void>;
  saveApiKey: (providerId: string, apiKey: string) => Promise<void>;
  getApiKey: (providerId: string) => Promise<string | null>;
  masterPasswordRef: React.MutableRefObject<string | null>;
}

const SecureConfigContext = createContext<SecureConfigContextState | undefined>(undefined);

export function SecureConfigProvider({ children }: { children: ReactNode }) {
  const [hasMasterPasswordSet, setHasMasterPasswordSet] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const masterPasswordRef = React.useRef<string | null>(null);

  useEffect(() => {
    // Check if a master password hash indicator exists in DB (we'll just use a 'master' provider entry as a flag for now)
    db.secureConfig.get('master_check').then(entry => {
      setHasMasterPasswordSet(!!entry);
    });
  }, []);

  const unlock = async (password: string) => {
    try {
      const entry = await db.secureConfig.get('master_check');
      if (!entry) return false;
      await decryptApiKey(entry, password);
      masterPasswordRef.current = password;
      setIsUnlocked(true);
      return true;
    } catch {
      return false;
    }
  };

  const lock = () => {
    masterPasswordRef.current = null;
    setIsUnlocked(false);
  };

  const setMasterPassword = async (password: string) => {
    // Encrypt a dummy value to verify the password later
    const entry = await encryptApiKey('master_check_validation', password, 'master_check');
    await db.secureConfig.put(entry);
    masterPasswordRef.current = password;
    setIsUnlocked(true);
    setHasMasterPasswordSet(true);
  };

  const saveApiKey = async (providerId: string, apiKey: string) => {
    if (!masterPasswordRef.current) throw new Error("Vault is locked");
    const entry = await encryptApiKey(apiKey, masterPasswordRef.current, providerId);
    await db.secureConfig.put(entry);
  };

  const getApiKey = async (providerId: string) => {
    if (!masterPasswordRef.current) return null;
    const entry = await db.secureConfig.get(providerId);
    if (!entry) return null;
    try {
      const key = await decryptApiKey(entry, masterPasswordRef.current);
      return key;
    } catch {
      return null;
    }
  };

  return (
    <SecureConfigContext.Provider value={{ hasMasterPasswordSet, isUnlocked, unlock, lock, setMasterPassword, saveApiKey, getApiKey, masterPasswordRef }}>
      {children}
    </SecureConfigContext.Provider>
  );
}

export function useSecureConfig() {
  const context = useContext(SecureConfigContext);
  if (context === undefined) {
    throw new Error('useSecureConfig must be used within a SecureConfigProvider');
  }
  return context;
}
