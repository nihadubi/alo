import { Send } from 'lucide-react'

function ChatArea({ messages }) {
  return (
    <main className="flex-1 flex flex-col bg-[#313338] text-slate-200">
      <div className="h-16 px-6 flex items-center justify-between border-b border-black/20">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Mesajlar</p>
          <h2 className="text-lg font-semibold text-slate-100">Ümumi söhbət</h2>
        </div>
        <div className="text-xs text-slate-500">Aktiv</div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="rounded-2xl bg-[#2B2D31] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-100">{message.room}</p>
              <span className="text-xs text-slate-500">{message.time}</span>
            </div>
            <p className="mt-2 text-sm text-slate-300">{message.text}</p>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-black/20">
        <div className="flex items-center gap-3 rounded-2xl bg-[#2B2D31] px-4 py-3">
          <input
            type="text"
            placeholder="Mesaj yaz..."
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none"
          />
          <button className="h-9 w-9 rounded-xl bg-indigo-500/80 text-white flex items-center justify-center hover:bg-indigo-500">
            <Send size={16} />
          </button>
        </div>
      </div>
    </main>
  )
}

export default ChatArea
