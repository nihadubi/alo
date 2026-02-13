import { useState } from 'react'
import { Plus, Settings } from 'lucide-react'
import { useUser } from '@clerk/clerk-react'

function CreateCommunityModal({ open, onClose }) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm rounded-2xl bg-[#2B2D31] p-6 text-slate-200 shadow-2xl">
        <h2 className="text-lg font-semibold">İcma yarat</h2>
        <p className="mt-1 text-xs text-slate-400">Yeni icma adı daxil edin</p>
        <input
          type="text"
          placeholder="Məsələn: Dizayn"
          className="mt-4 w-full rounded-xl bg-[#1E1F22] px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:ring-1 focus:ring-slate-500/50"
        />
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
          >
            Bağla
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-indigo-500/80 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-500"
          >
            Yarat
          </button>
        </div>
      </div>
    </div>
  )
}

function NavigationSidebar({ communities }) {
  const { user } = useUser()
  const [isOpen, setIsOpen] = useState(false)

  const imageUrl = user?.imageUrl
  const initials = user?.firstName?.[0] || user?.username?.[0] || 'U'

  return (
    <aside className="w-20 bg-[#1E1F22] flex flex-col items-center py-4 gap-4">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="h-12 w-12 rounded-2xl bg-[#313338] text-slate-200 flex items-center justify-center hover:bg-indigo-500/80 transition-colors"
      >
        <Plus size={18} />
      </button>

      <div className="flex-1 w-full flex flex-col items-center gap-3 overflow-y-auto custom-scrollbar">
        {communities.map((community) => (
          <div
            key={community.id}
            className="h-12 w-12 rounded-2xl bg-[#313338] text-slate-200 flex items-center justify-center text-xs font-semibold"
          >
            {community.initials}
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3 pb-2">
        <div className="h-12 w-12 rounded-2xl bg-[#313338] flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt="Profil" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-semibold text-slate-200">{initials}</span>
          )}
        </div>
        <button className="h-12 w-12 rounded-2xl bg-[#313338] text-slate-300 flex items-center justify-center hover:text-slate-100">
          <Settings size={18} />
        </button>
      </div>

      <CreateCommunityModal open={isOpen} onClose={() => setIsOpen(false)} />
    </aside>
  )
}

export default NavigationSidebar
