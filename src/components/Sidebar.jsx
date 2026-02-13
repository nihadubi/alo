import { Plus, Settings, Users } from 'lucide-react'
import { UserButton } from '@clerk/clerk-react'

function Sidebar({ communities, displayName, displayStatus }) {
  return (
    <aside className="w-72 bg-slate-900/90 flex flex-col border-r border-slate-800/60">
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
    </aside>
  )
}

export default Sidebar
