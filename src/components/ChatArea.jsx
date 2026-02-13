import { Hash, Search } from 'lucide-react'

function ChatArea({ displayName, messages }) {
  return (
    <main className="flex-1 flex flex-col bg-slate-950">
      <div className="h-16 px-8 flex items-center justify-between bg-slate-950/70 border-b border-slate-800/40">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Dashboard</p>
          <h2 className="text-lg font-semibold text-slate-100">Xoş gəldin, {displayName}</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Otaq və ya icma axtar..."
            className="w-64 bg-slate-900/60 text-slate-200 placeholder-slate-500 rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:ring-1 focus:ring-slate-700 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6 space-y-4">
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5">
          <h3 className="text-sm font-semibold text-slate-100">Son mesajlar</h3>
          <p className="text-xs text-slate-500 mt-1">Seçilmiş otaqlardakı aktivlik</p>
        </div>

        <div className="space-y-3">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start gap-3 rounded-2xl border border-slate-800/50 bg-slate-900/60 px-4 py-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-300">
                <Hash size={16} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-100">{message.room}</p>
                  <span className="text-xs text-slate-500">{message.time}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{message.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default ChatArea
