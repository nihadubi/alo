import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { io } from 'socket.io-client'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'

function ChatArea() {
  const { getToken, isSignedIn, userId } = useAuth()
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [activeCommunity, setActiveCommunity] = useState(null)
  const socketRef = useRef(null)

  const formatTime = (value) => {
    if (!value) {
      return ''
    }
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return ''
    }
    return new Intl.DateTimeFormat('az-AZ', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const appendMessage = (message) => {
    setMessages((prev) => {
      if (prev.some((item) => item.id === message.id)) {
        return prev
      }
      return [...prev, message]
    })
  }

  useEffect(() => {
    if (!isSignedIn) {
      return
    }

    const loadCommunities = async () => {
      try {
        const token = await getToken()
        if (!token) {
          return
        }
        const response = await axios.get('/api/communities', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (Array.isArray(response.data) && response.data.length > 0) {
          setActiveCommunity(response.data[0])
        }
      } catch (error) {
        console.error('Communities fetch failed', error)
      }
    }

    loadCommunities()
  }, [getToken, isSignedIn])

  useEffect(() => {
    if (!isSignedIn || !activeCommunity?.id) {
      return
    }

    const loadMessages = async () => {
      try {
        const token = await getToken()
        if (!token) {
          return
        }
        const response = await axios.get('/api/messages', {
          params: {
            communityId: activeCommunity.id,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (Array.isArray(response.data)) {
          setMessages(response.data)
        }
      } catch (error) {
        console.error('Messages fetch failed', error)
      }
    }

    loadMessages()
  }, [activeCommunity?.id, getToken, isSignedIn])

  useEffect(() => {
    if (!isSignedIn || socketRef.current) {
      return
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'
    const socket = io(socketUrl, {
      transports: ['websocket'],
    })

    socket.on('message:new', (payload) => {
      if (payload?.id) {
        appendMessage(payload)
      }
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [isSignedIn])

  useEffect(() => {
    if (!socketRef.current || !activeCommunity?.id) {
      return
    }
    socketRef.current.emit('room:join', { communityId: activeCommunity.id })
  }, [activeCommunity?.id])

  const handleSend = async () => {
    const content = messageInput.trim()
    if (!content || isSending || !activeCommunity?.id) {
      return
    }

    try {
      setIsSending(true)
      const token = await getToken()
      if (!token) {
        return
      }
      const response = await axios.post(
        '/api/messages',
        { content, communityId: activeCommunity.id, userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      if (response.data?.id) {
        appendMessage(response.data)
        setMessageInput('')
      }
    } catch (error) {
      console.error('Message send failed', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <main className="flex-1 flex flex-col bg-[#313338] text-slate-200">
      <div className="h-16 px-6 flex items-center justify-between border-b border-black/20">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Mesajlar</p>
          <h2 className="text-lg font-semibold text-slate-100">
            {activeCommunity?.name || 'Ümumi söhbət'}
          </h2>
        </div>
        <div className="text-xs text-slate-500">Aktiv</div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="rounded-2xl bg-[#2B2D31] p-4 flex gap-3">
            <div className="h-10 w-10 rounded-full bg-[#1E1F22] flex items-center justify-center overflow-hidden">
              {message.profile?.imageUrl ? (
                <img
                  src={message.profile.imageUrl}
                  alt={message.profile?.name || 'Profil'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-slate-300">
                  {(message.profile?.name || 'U')[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-slate-100">
                  {message.profile?.name || 'İstifadəçi'}
                </p>
                <span className="text-xs text-slate-500">{formatTime(message.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-black/20">
        <div className="flex items-center gap-3 rounded-2xl bg-[#2B2D31] px-4 py-3">
          <input
            type="text"
            placeholder="Mesaj yaz..."
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none"
            value={messageInput}
            onChange={(event) => setMessageInput(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending}
            className="h-9 w-9 rounded-xl bg-indigo-500/80 text-white flex items-center justify-center hover:bg-indigo-500 disabled:opacity-60"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </main>
  )
}

export default ChatArea
