import { useEffect, useState } from 'react';
import { Hash, Plus, Search, Settings, Users } from 'lucide-react';
import { SignedIn, SignedOut, SignIn, SignUp, UserButton, useAuth, useUser } from '@clerk/clerk-react';

function App() {
  const [authView, setAuthView] = useState('signIn');
  const [profileSyncStatus, setProfileSyncStatus] = useState('idle');
  const { isSignedIn, userId, getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const syncProfile = async () => {
      if (!isSignedIn || !userId || profileSyncStatus === 'done') {
        return;
      }

      try {
        setProfileSyncStatus('loading');
        const token = await getToken();

        if (!token) {
          setProfileSyncStatus('error');
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
          setProfileSyncStatus('error');
          return;
        }

        setProfileSyncStatus('done');
      } catch (error) {
        console.error('Profile sync failed', error);
        setProfileSyncStatus('error');
      }
    };

    syncProfile();
  }, [getToken, isSignedIn, profileSyncStatus, userId]);

  const communities = [
    { id: 1, name: 'Dizayn', initials: 'DZ', members: 128, rooms: 8 },
    { id: 2, name: 'Mühəndislik', initials: 'MH', members: 64, rooms: 12 },
    { id: 3, name: 'Marketinq', initials: 'MK', members: 42, rooms: 5 },
  ];

  const rooms = [
    { id: 1, name: 'ui-feedback', community: 'Dizayn', unread: 3, lastActive: '2 dəq əvvəl' },
    { id: 2, name: 'release-plan', community: 'Mühəndislik', unread: 0, lastActive: '12 dəq əvvəl' },
    { id: 3, name: 'campaign-ideas', community: 'Marketinq', unread: 5, lastActive: '1 saat əvvəl' },
    { id: 4, name: 'team-sync', community: 'Mühəndislik', unread: 1, lastActive: 'dünən' },
  ];

  const displayName = user?.fullName || user?.username || 'İstifadəçi'
  const displayStatus = user?.primaryEmailAddress?.emailAddress || 'Online'

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
        <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
          <div className="w-72 bg-slate-900 flex flex-col border-r border-slate-800/50">
            <div className="p-5 flex items-center justify-between">
              <h1 className="text-xl font-semibold tracking-tight text-slate-100">Alo</h1>
              <button className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-100">
                <Settings size={18} />
              </button>
            </div>

            <div className="px-5">
              <button className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-slate-800/60 text-slate-100 hover:bg-slate-800 transition-colors">
                <span className="text-sm font-medium">İcma yarat</span>
                <span className="w-8 h-8 rounded-lg bg-slate-900/60 flex items-center justify-center">
                  <Plus size={16} />
                </span>
              </button>
            </div>

            <div className="px-5 mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              İcmalar
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4 space-y-3">
              {communities.map((community) => (
                <div key={community.id} className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center text-sm font-semibold">
                      {community.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-100">{community.name}</p>
                      <p className="text-xs text-slate-500">{community.rooms} otaq</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Users size={14} />
                    <span>{community.members}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-slate-800/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                <UserButton afterSignOutUrl="/" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{displayName}</p>
                <p className="text-xs text-slate-500 truncate">{displayStatus}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-slate-950">
            <div className="h-16 px-8 flex items-center justify-between bg-slate-950/70 border-b border-slate-800/40">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Dashboard</p>
                <h2 className="text-lg font-semibold text-slate-100">Xoş gəldin, {displayName}</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    placeholder="Otaq və ya icma axtar..."
                    className="w-64 bg-slate-900/60 text-slate-200 placeholder-slate-500 rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:ring-1 focus:ring-slate-700 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Aktiv otaqlar</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-100">14</p>
                  <p className="text-xs text-slate-500">Son 24 saatda 6 yeni</p>
                </div>
                <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Yeni mesajlar</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-100">32</p>
                  <p className="text-xs text-slate-500">4 icmadan</p>
                </div>
                <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Onlayn üzvlər</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-100">186</p>
                  <p className="text-xs text-slate-500">Yüksəliş trendində</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-100">Son aktiv otaqlar</h3>
                    <p className="text-xs text-slate-500">Komandaların ritmini izləyin</p>
                  </div>
                  <button className="text-xs font-semibold text-slate-400 hover:text-slate-200">Hamısına bax</button>
                </div>
                <div className="mt-4 space-y-3">
                  {rooms.map((room) => (
                    <div key={room.id} className="flex items-center justify-between rounded-xl border border-slate-800/40 bg-slate-900/60 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-300">
                          <Hash size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-100">{room.name}</p>
                          <p className="text-xs text-slate-500">{room.community} • {room.lastActive}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {room.unread > 0 && (
                          <span className="text-xs font-semibold text-blue-300 bg-blue-500/10 px-2 py-1 rounded-full">
                            {room.unread} yeni
                          </span>
                        )}
                        <button className="text-xs font-semibold text-slate-400 hover:text-slate-200">Daxil ol</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SignedIn>
    </>
  );
}

export default App;
