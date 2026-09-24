import React from 'react';
import { X, Key, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, Terminal } from 'lucide-react';
import { mintOneMapToken, getStoredOneMapToken, saveOneMapToken, clearOneMapToken, searchOneMapAddress } from '../services/onemapApi';

interface OneMapTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenUpdated: () => void;
}

export const OneMapTokenModal: React.FC<OneMapTokenModalProps> = ({
  isOpen,
  onClose,
  onTokenUpdated
}) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [manualToken, setManualToken] = React.useState('');
  const [statusMessage, setStatusMessage] = React.useState<{ text: string; isError: boolean } | null>(null);
  const [isMinting, setIsMinting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<string | null>(null);
  const [isTesting, setIsTesting] = React.useState(false);

  const currentToken = getStoredOneMapToken();

  if (!isOpen) return null;

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setStatusMessage({ text: 'Please enter both your OneMap registered email and password.', isError: true });
      return;
    }

    setIsMinting(true);
    setStatusMessage(null);
    try {
      await mintOneMapToken(email, password);
      setStatusMessage({ text: 'Token minted successfully! Valid for 3 days.', isError: false });
      onTokenUpdated();
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to mint token. Please verify credentials.', isError: true });
    } finally {
      setIsMinting(false);
    }
  };

  const handleSaveManual = () => {
    if (!manualToken.trim()) return;
    saveOneMapToken(manualToken.trim(), 3);
    setStatusMessage({ text: 'Manual token saved successfully (valid 3 days).', isError: false });
    setManualToken('');
    onTokenUpdated();
  };

  const handleClear = () => {
    clearOneMapToken();
    setStatusMessage({ text: 'Stored token removed. Public geocode mode active.', isError: false });
    onTokenUpdated();
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await searchOneMapAddress('raffles place');
      if (res) {
        setTestResult(`Success! Geocoded "${res.BUILDING || res.SEARCHVAL}" · Postal: ${res.POSTAL} · Coord: ${res.LATITUDE}, ${res.LONGITUDE}`);
      } else {
        setTestResult('No results returned.');
      }
    } catch (err: any) {
      setTestResult(`Error: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">
              <Key className="w-3.5 h-3.5" />
              <span>Singapore OneMap API Integration</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              OneMap Token & Credentials Manager
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Mint official 3-day authentication tokens or provide an existing key for Singapore Land Authority OneMap routing and geocoding services.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status Box */}
        <div className="p-3.5 rounded-xl border bg-slate-950 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${currentToken ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <div>
              <span className="font-semibold text-white">
                {currentToken ? 'Authenticated OneMap Session' : 'Public Fallback Mode Active'}
              </span>
              <div className="text-[11px] text-slate-400">
                {currentToken
                  ? 'Official token active: Full Routing (Walk/Cycle/PT/Drive) and Geocoding enabled'
                  : 'Basic Geocoding & High-res map tiles active. Add token for live multi-modal routing.'}
              </div>
            </div>
          </div>

          {currentToken && (
            <button
              onClick={handleClear}
              className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 bg-rose-950/40 border border-rose-900/60 rounded-md"
            >
              Disconnect
            </button>
          )}
        </div>

        {/* Status Alert */}
        {statusMessage && (
          <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
            statusMessage.isError
              ? 'bg-rose-950/40 border-rose-800/80 text-rose-300'
              : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
          }`}>
            {statusMessage.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Option 1: Mint Token (POST /api/auth/post/getToken) */}
        <form onSubmit={handleMint} className="space-y-3 bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white uppercase tracking-wider">
              Option 1: Mint Token via OneMap Account
            </span>
            <a
              href="https://www.onemap.gov.sg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
            >
              <span>Register OneMap account</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">OneMap Email</label>
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isMinting}
            className="w-full py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            {isMinting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>Mint 3-Day Token (POST /api/auth/post/getToken)</span>
          </button>
        </form>

        {/* Option 2: Enter Existing Token */}
        <div className="space-y-3 bg-slate-950/60 border border-slate-800 p-4 rounded-xl text-xs">
          <span className="font-semibold text-white uppercase tracking-wider block">
            Option 2: Paste Existing OneMap Token
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="eyJhbGciOi..."
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-white font-mono text-xs focus:outline-none focus:border-rose-500"
            />
            <button
              type="button"
              onClick={handleSaveManual}
              disabled={!manualToken.trim()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-md font-medium transition-colors"
            >
              Save Token
            </button>
          </div>
        </div>

        {/* Test Diagnostics */}
        <div className="border-t border-slate-800 pt-3 flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Endpoint Live Diagnostics:</span>
            <button
              onClick={handleRunTest}
              disabled={isTesting}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1 text-[11px]"
            >
              <Terminal className="w-3 h-3" />
              <span>{isTesting ? 'Pinging...' : 'Test Geocode ("Raffles Place")'}</span>
            </button>
          </div>
          {testResult && (
            <div className="p-2.5 bg-slate-950 font-mono text-[11px] text-slate-300 rounded border border-slate-800">
              {testResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
