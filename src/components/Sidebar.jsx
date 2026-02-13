import { Plus, Settings } from 'lucide-react'
import { UserButton } from '@clerk/clerk-react'

function Sidebar() {
  return (
    <aside className="w-20 bg-[#1E1F22] flex flex-col items-center py-4">
      <button className="h-12 w-12 rounded-2xl bg-[#313338] text-slate-200 flex items-center justify-center hover:bg-indigo-500/80 transition-colors">
        <Plus size={18} />
      </button>

      <div className="mt-auto flex flex-col items-center gap-3 pb-2">
        <div className="h-12 w-12 rounded-2xl bg-[#313338] flex items-center justify-center overflow-hidden">
          <UserButton afterSignOutUrl="/" />
        </div>
        <button className="h-12 w-12 rounded-2xl bg-[#313338] text-slate-300 flex items-center justify-center hover:text-slate-100">
          <Settings size={18} />
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
