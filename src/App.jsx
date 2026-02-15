import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SignedIn, SignedOut, SignIn, SignUp, useAuth, useUser } from '@clerk/clerk-react';
import { Minus, Square, X } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import ChatArea from './components/ChatArea.jsx';
import MediaRoom from './components/MediaRoom.jsx';

function TitleBar() {
  const hasControls = typeof window !== 'undefined' && window.electronAPI;

  if (!hasControls) {
    return null;
  }

  return (
    <div className="app-titlebar">
      <div className="app-titlebar__drag">
        <div className="app-titlebar__logo">A</div>
        <span className="text-[11px] uppercase tracking-[0.4em] text-slate-400">Alo</span>
      </div>
      <div className="app-titlebar__controls">
        <button
          type="button"
          className="app-titlebar__button"
          onClick={() => window.electronAPI?.minimize()}
        >
          <Minus size={14} />
        </button>
        <button
          type="button"
          className="app-titlebar__button"
          onClick={() => window.electronAPI?.toggleMaximize()}
        >
          <Square size={13} />
        </button>
        <button
          type="button"
          className="app-titlebar__button app-titlebar__button--danger"
          onClick={() => window.electronAPI?.close()}
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
  const [voiceChannel, setVoiceChannel] = useState(null);
  const [voiceParticipants, setVoiceParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isDM, setIsDM] = useState(false);
  const [members, setMembers] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [now, setNow] = useState(0);
  const { isSignedIn, userId, getToken } = useAuth();
  const { user } = useUser();
  const profileSyncRef = useRef({ status: 'idle', userId: null });
  const windowBaseUrl = typeof window !== 'undefined' ? window.__APP_BASE_URL__ : '';
  const apiBaseUrl = windowBaseUrl || (import.meta.env.PROD ? import.meta.env.VITE_API_BASE_URL : import.meta.env.VITE_API_BASE_URL || '');

  const handleChannelChange = useCallback((channel) => {
    setActiveChannel(channel);
    setIsDM(false);
  }, []);

  const handleJoinAudio = useCallback((channel) => {
    setVoiceChannel(channel);
    setIsDM(false);
  }, []);

  const handleDisconnectVoice = useCallback(() => {
    setVoiceChannel(null);
    setVoiceParticipants([]);
    setIsVoiceLive(false);
    setIsMuted(false);
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const handleToggleDM = useCallback(() => {
    setIsDM(true);
  }, []);

  const handleMembersChange = useCallback((items) => {
    setMembers(items);
  }, []);

  const handleVoiceParticipantsChange = useCallback((items) => {
    setVoiceParticipants(items);
  }, []);

  const membersWithSelf = useMemo(() => {
    const list = members.filter((member) => member.name).map((member) => ({ ...member }));
    const name = displayName || user?.fullName || user?.username || 'Sən';
    const imageUrl = user?.imageUrl || '';
    const hasSelf = list.some((item) => item.name === name && item.imageUrl === imageUrl);
    if (!hasSelf && name) {
      list.unshift({ name, imageUrl, lastSeen: now, isSelf: true });
    }
    return list;
  }, [displayName, members, now, user]);

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

        const payload = await response.json().catch(() => null);
        if (payload?.profile?.name) {
          setDisplayName(payload.profile.name);
        }

        profileSyncRef.current = { status: 'done', userId };
      } catch (error) {
        console.error('Profile sync failed', error);
        profileSyncRef.current = { status: 'error', userId };
      }
    };

    syncProfile();
  }, [apiBaseUrl, getToken, isSignedIn, userId]);

  useEffect(() => {
    if (!displayName && (user?.fullName || user?.username)) {
      const timeout = setTimeout(() => {
        setDisplayName(user?.fullName || user?.username || '');
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [displayName, user]);

  useEffect(() => {
    const tick = () => {
      setNow(Date.now());
    };
    const timeout = setTimeout(tick, 0);
    const timer = setInterval(tick, 60000);
    return () => {
      clearTimeout(timeout);
      clearInterval(timer);
    };
  }, []);

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
            onChannelChange={handleChannelChange}
            isVoiceLive={isVoiceLive}
            isDM={isDM}
            onToggleDM={handleToggleDM}
            voiceChannel={voiceChannel}
            voiceParticipants={voiceParticipants}
            onJoinAudio={handleJoinAudio}
            onDisconnectVoice={handleDisconnectVoice}
            displayName={displayName}
            onDisplayNameChange={setDisplayName}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
          <div className="flex flex-1 overflow-hidden">
            {isDM ? (
              <div className="flex-1 flex flex-col bg-[#313338] text-slate-200">
                <div className="h-16 px-6 flex items-center justify-between border-b border-black/20">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Direct Messages</p>
                    <h2 className="text-lg font-semibold text-slate-100">DM</h2>
                  </div>
                  <div className="text-xs text-slate-500">Hazırdır</div>
                </div>
                <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
                  Bir DM seçin və söhbətə başlayın
                </div>
              </div>
            ) : (
              <ChatArea activeChannel={activeChannel} onMembersChange={handleMembersChange} />
            )}
            {voiceChannel ? (
              <div className="hidden">
                <MediaRoom
                  roomName={voiceChannel.name || 'General'}
                  onConnectionChange={setIsVoiceLive}
                  onParticipantsChange={handleVoiceParticipantsChange}
                  micEnabled={!isMuted}
                />
              </div>
            ) : null}
            {!isDM && activeChannel?.type !== 'audio' ? (
              <div className="w-56 bg-[#1E1F22] border-l border-black/20 flex flex-col">
                <div className="h-16 px-3 flex items-center border-b border-black/20">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Üzvlər</p>
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 custom-scrollbar">
                  {membersWithSelf.length === 0 ? (
                    <div className="text-xs text-slate-500">Üzv tapılmadı</div>
                  ) : (
                    membersWithSelf.map((member, index) => {
                      const lastSeen = member.lastSeen ? new Date(member.lastSeen).getTime() : 0;
                      const isOnline = member.isSelf || (lastSeen && now - lastSeen < 5 * 60 * 1000);
                      return (
                        <div
                          key={`${member.name}-${member.imageUrl || 'no-image'}-${index}`}
                          className="flex items-center gap-3 rounded-xl bg-[#2B2D31] px-3 py-2"
                        >
                          <div className="relative h-9 w-9 rounded-full bg-[#111318] overflow-hidden flex items-center justify-center">
                            {member.imageUrl ? (
                              <img src={member.imageUrl} alt={member.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-xs font-semibold text-slate-200">
                                {(member.name || 'U')[0]?.toUpperCase()}
                              </span>
                            )}
                            <span
                              className={`absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#2B2D31] ${
                                isOnline ? 'bg-emerald-400' : 'bg-slate-500'
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-200">{member.name}</p>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                              {isOnline ? 'Onlayn' : 'Oflayn'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </SignedIn>
    </div>
  );
}

export default App;
