import { useEffect, useState } from 'react'
import axios from 'axios'
import { Plus } from 'lucide-react'
import { UserButton, useAuth } from '@clerk/clerk-react'

function Sidebar() {
  const { getToken } = useAuth()
  const [communities, setCommunities] = useState([])

  useEffect(() => {
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
        if (Array.isArray(response.data)) {
          setCommunities(response.data)
        }
      } catch (error) {
        console.error('Communities fetch failed', error)
      }
    }

    loadCommunities()
  }, [getToken])

  const getInitials = (name) =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')

  return (
    <aside className="w-[72px] bg-[#1E1F22] flex flex-col items-center py-4">
      <button className="h-12 w-12 rounded-2xl bg-[#313338] text-slate-200 flex items-center justify-center hover:bg-indigo-500/80 transition-colors">
        <Plus size={18} />
      </button>

      <div className="flex-1 w-full mt-4 flex flex-col items-center gap-3 overflow-y-auto custom-scrollbar">
        {communities.map((community) => (
          <div
            key={community.id}
            className="h-12 w-12 rounded-2xl bg-[#2B2D31] text-slate-200 flex items-center justify-center text-xs font-semibold"
          >
            {getInitials(community.name || '') || 'C'}
          </div>
        ))}
      </div>

      <div className="pb-2">
        <div className="h-12 w-12 rounded-2xl bg-[#313338] flex items-center justify-center overflow-hidden">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
