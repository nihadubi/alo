import { useEffect, useRef, useState } from 'react';
import { SignedIn, SignedOut, SignIn, SignUp, useAuth } from '@clerk/clerk-react';
import Sidebar from './components/Sidebar.jsx';
import ChatArea from './components/ChatArea.jsx';

function App() {
  const [authView, setAuthView] = useState('signIn');
  const { isSignedIn, userId, getToken } = useAuth();
  const profileSyncRef = useRef({ status: 'idle', userId: null });

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

        const response = await fetch('/api/profile/sync', {
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
  }, [getToken, isSignedIn, userId]);

  const messages = [
    { id: 1, room: 'ui-feedback', text: 'Yeni ikon seti hazırdır, baxa bilərsən?', time: '2 dəq əvvəl' },
    { id: 2, room: 'release-plan', text: 'Release checklisti yeniləndi.', time: '12 dəq əvvəl' },
    { id: 3, room: 'campaign-ideas', text: 'Kampaniya ideyalarını topladım.', time: '1 saat əvvəl' },
    { id: 4, room: 'team-sync', text: 'Sabahkı sync üçün gündəmi göndərirəm.', time: 'dünən' },
  ];

  return (
    <>
      <SignedOut>
        <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center px-6">
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
        <div className="flex h-screen bg-[#2B2D31] text-slate-200 overflow-hidden font-sans">
          <Sidebar />
          <ChatArea messages={messages} />
        </div>
      </SignedIn>
    </>
  );
}

export default App;
