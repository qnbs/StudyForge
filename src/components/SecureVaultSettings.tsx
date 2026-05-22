import { useState } from 'react';
import { useSecureConfig } from '../contexts/SecureConfigContext';
import { Lock, Key, CheckCircle, ShieldAlert } from 'lucide-react';

export function SecureVaultSettings() {
  const { hasMasterPasswordSet, isUnlocked, unlock, lock, setMasterPassword, saveApiKey, getApiKey } = useSecureConfig();
  
  const [passwordInput, setPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [openAIKeyInput, setOpenAIKeyInput] = useState('');
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const handleUnlock = async () => {
    setError(null);
    const success = await unlock(passwordInput);
    if (!success) {
      setError('Incorrect master password');
    } else {
      setPasswordInput('');
      loadKeys();
    }
  };

  const handleSetMaster = async () => {
    if (newPasswordInput.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setError(null);
    await setMasterPassword(newPasswordInput);
    setNewPasswordInput('');
    loadKeys();
  };

  const loadKeys = async () => {
    const gKey = await getApiKey('gemini');
    const oKey = await getApiKey('openai');
    if (gKey) setGeminiKeyInput('*'.repeat(15) + gKey.slice(-4));
    if (oKey) setOpenAIKeyInput('*'.repeat(15) + oKey.slice(-4));
  };

  const handleSaveKeys = async () => {
    try {
      if (geminiKeyInput && !geminiKeyInput.includes('***')) await saveApiKey('gemini', geminiKeyInput);
      if (openAIKeyInput && !openAIKeyInput.includes('***')) await saveApiKey('openai', openAIKeyInput);
      setSavedStatus('Keys saved successfully!');
      setTimeout(() => setSavedStatus(null), 3000);
      loadKeys();
    } catch {
      setError('Failed to save keys');
    }
  };

  if (!hasMasterPasswordSet) {
    return (
      <div className="bg-white border text-left border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-500" />
          <div>
            <h3 className="font-semibold text-slate-900">Secure Vault Not Setup</h3>
            <p className="text-xs text-slate-500">Create a master password to encrypt your external API keys.</p>
          </div>
        </div>
        <div className="space-y-3">
          <input 
            type="password" 
            placeholder="Set Master Password (min 8 chars)" 
            value={newPasswordInput}
            onChange={(e) => setNewPasswordInput(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button 
            onClick={handleSetMaster}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 w-full"
          >
            Create Vault
          </button>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="bg-white border text-left border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <Lock className="w-6 h-6 text-slate-400" />
          <div>
            <h3 className="font-semibold text-slate-900">Vault Locked</h3>
            <p className="text-xs text-slate-500">Enter master password to manage your BYOK API keys.</p>
          </div>
        </div>
        <div className="space-y-3 flex gap-2">
          <input 
            type="password" 
            placeholder="Master Password" 
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            onClick={handleUnlock}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shrink-0"
          >
            Unlock
          </button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="bg-indigo-50 border text-left border-indigo-100 rounded-xl p-5 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Key className="w-6 h-6 text-indigo-600" />
          <div>
            <h3 className="font-semibold text-indigo-900">Cloud Fallbacks (BYOK)</h3>
            <p className="text-xs text-indigo-700">Keys are encrypted with AES-256 and stored locally in IndexedDB.</p>
          </div>
        </div>
        <button onClick={lock} className="text-xs font-medium text-indigo-700 hover:text-indigo-900 flex items-center gap-1 bg-white px-2 py-1 rounded border border-indigo-200">
          <Lock className="w-3 h-3" /> Lock Vault
        </button>
      </div>

      <div className="space-y-4 pt-2 border-t border-indigo-200">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Gemini API Key</label>
          <input 
            type="password" 
            value={geminiKeyInput}
            onChange={(e) => setGeminiKeyInput(e.target.value)}
            placeholder="AIza..."
            className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">OpenAI API Key</label>
          <input 
            type="password" 
            value={openAIKeyInput}
            onChange={(e) => setOpenAIKeyInput(e.target.value)}
            placeholder="sk-..."
            className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          {savedStatus ? (
            <span className="text-sm text-emerald-600 flex items-center gap-1 font-medium"><CheckCircle className="w-4 h-4" /> {savedStatus}</span>
          ) : (
            <span className="text-xs text-slate-500">Only saved on your device.</span>
          )}
          <button 
            onClick={handleSaveKeys}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Encrypt & Save
          </button>
        </div>
      </div>
    </div>
  );
}
