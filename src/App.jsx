import { useEffect, useRef, useState } from 'react';
import { SignedIn, SignedOut, SignIn, SignUp, useAuth } from '@clerk/clerk-react';
import { Minus, Square, X } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import ChatArea from './components/ChatArea.jsx';
import MediaRoom from './components/MediaRoom.jsx';

function TitleBar() {
  const hasControls = typeof window !== 'undefined' && window.electronControls;

  if (!hasControls) {
    return null;
  }

  return (
    <div className="app-titlebar">
      <div className="app-titlebar__drag">
        <span className="text-[11px] uppercase tracking-[0.4em] text-slate-400">Alo</span>
      </div>
      <div className="app-titlebar__controls">
        <button
          type="button"
          className="app-titlebar__button"
          onClick={() => window.electronControls?.minimize()}
        >
          <Minus size={14} />
        </button>
        <button
          type="button"
          className="app-titlebar__button"
          onClick={() => window.electronControls?.toggleMaximize()}
        >
          <Square size={13} />
        </button>
        <button
          type="button"
          className="app-titlebar__button app-titlebar__button--danger"
          onClick={() => window.electronControls?.close()}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

function App() {
  const [authView, setAuthView] = useState('signIn');
  const [activeChannel, setActiveChannel] = useState({ type: 'text', name: 'General', id: null });
  const [isVoiceLive, setIsVoiceLive] = useState(false);
  const { isSignedIn, userId, getToken } = useAuth();
  const profileSyncRef = useRef({ status: 'idle', userId: null });
  const apiBaseUrl = import.meta.env.PROD ? import.meta.env.VITE_API_BASE_URL : import.meta.env.VITE_API_BASE_URL || '';

  useEffect(() => {
    const syncProfile = async () => {
      if (!isSignedIn || !userId) {
        return;
      }

      const current = profileSyncRef.current;
      if (current.userId === userId && (current.status === 'loading' || current.status === 'done')) {
        return;
      }

      try {
        profileSyncRef.current = { status: 'loading', userId };
        const token = await getToken();

        if (!token) {
          profileSyncRef.current = { status: 'error', userId };
          return;
        }

        const response = await fetch(apiBaseUrl ? `${apiBaseUrl}/api/profile/sync` : '/api/profile/sync', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          profileSyncRef.current = { status: 'error', userId };
          return;
        }

        profileSyncRef.current = { status: 'done', userId };
      } catch (error) {
        console.error('Profile sync failed', error);
        profileSyncRef.current = { status: 'error', userId };
      }
    };

    syncProfile();
  }, [apiBaseUrl, getToken, isSignedIn, userId]);

  return (
    <div className="min-h-screen flex flex-col">
      <TitleBar />
      <SignedOut>
        <div className="flex-1 bg-slate-950 text-slate-200 flex items-center justify-center px-6">
          <div className="w-full max-w-md bg-slate-900/70 border border-slate-800/60 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAuthView('signIn')}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                  authView === 'signIn'
                    ? 'bg-slate-800 text-slate-100'
                    : 'bg-slate-950/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                Giriş
              </button>
              <button
                type="button"
                onClick={() => setAuthView('signUp')}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                  authView === 'signUp'
                    ? 'bg-slate-800 text-slate-100'
                    : 'bg-slate-950/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                Qeydiyyat
              </button>
            </div>
            <div className="mt-6">
              {authView === 'signIn' ? (
                <SignIn afterSignInUrl="/" />
              ) : (
                <SignUp afterSignUpUrl="/" />
              )}
            </div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="flex flex-1 bg-[#2B2D31] text-slate-200 overflow-hidden font-sans">
          <Sidebar
            activeChannel={activeChannel}
            onChannelChange={setActiveChannel}
            isVoiceLive={isVoiceLive}
          />
          {activeChannel?.type === 'audio' ? (
            <MediaRoom roomName={activeChannel.name || 'General'} onConnectionChange={setIsVoiceLive} />
          ) : (
            <ChatArea activeChannel={activeChannel} />
          )}
        </div>
      </SignedIn>
    </div>
  );
}

export default App;
