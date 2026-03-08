 'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function Sidebar() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserEmail(user?.email || null)
    }
    getUser()
  }, [])

  const menus = [
    { name: 'Daftar Materi', icon: '📚', path: '/materi' },
    { name: 'Peraturan', icon: '📂', path: '/peraturan' },
  ]

  const isAdmin = userEmail === 'mukhtartheacanva@gmail.com'

  return (
    /* Lebar kita naikkan ke w-72 pada desktop, dan mengecil jadi w-20 pada mobile/tablet */
    <aside className="w-20 md:w-72 bg-amber-950 fixed top-0 left-0 bottom-0 border-r border-white/10 p-4 md:p-6 flex flex-col z-50 shadow-2xl transition-all duration-300">
      
      {/* Texture Kayu */}
      <div 
        className="absolute inset-0 z-[-1] opacity-20" 
        style={{ 
          backgroundImage: `url('https://www.transparenttextures.com/patterns/wood-pattern.png')`,
          backgroundRepeat: 'repeat'
        }}
      />

      {/* Header: Hanya Icon di layar kecil, Teks muncul di layar besar */}
      <div className="text-2xl font-black mb-10 text-amber-100 italic flex items-center justify-center md:justify-start gap-3">
        <span className="text-3xl">🏛️</span> 
        <span className="hidden md:block tracking-tighter uppercase">SI-DUGI</span>
      </div>
      
      <nav className="flex-grow space-y-3">
        {menus.map((menu) => {
          const isActive = pathname === menu.path

          return (
            <Link 
              key={menu.path} 
              href={menu.path}
              className={`flex items-center justify-center md:justify-start gap-3 p-4 rounded-2xl font-black transition-all duration-300 border ${
                isActive 
                ? 'bg-amber-100 text-amber-950 shadow-xl border-white md:translate-x-2' 
                : 'text-amber-200/60 border-transparent hover:bg-white/5 hover:text-amber-100'
              }`}
            >
              <span className={`text-xl ${isActive ? 'scale-125' : 'grayscale'} transition-all`}>
                {menu.icon}
              </span> 
              {/* Sembunyikan teks di layar kecil */}
              <span className="hidden md:block text-[11px] uppercase tracking-widest truncate">
                {menu.name}
              </span>
            </Link>
          )
        })}

        {isAdmin && (
          <Link 
            href="/admin" 
            className={`flex items-center justify-center md:justify-start gap-3 p-4 rounded-2xl font-black transition-all border ${
              pathname === '/admin'
              ? 'bg-orange-500 text-white border-white shadow-xl md:translate-x-2' 
              : 'text-orange-400 border-transparent hover:bg-orange-500/10'
            }`}
          >
            <span className="text-xl">🛠️</span> 
            <span className="hidden md:block text-[11px] uppercase tracking-widest truncate">
              Admin Panel
            </span>
          </Link>
        )}
      </nav>

      {/* User Info - Sembunyikan di layar kecil untuk menjaga kerapihan */}
      <div className="hidden md:block mt-auto mb-6 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner overflow-hidden">
        <p className="text-[8px] text-amber-200/50 font-black uppercase tracking-[0.2em] mb-1">Login Sebagai:</p>
        <p className="text-[10px] font-bold truncate text-amber-100 italic break-all leading-tight">
          {userEmail || 'Memuat...'}
        </p>
      </div>

      <button 
        onClick={async () => {
          if(confirm("Yakin ingin keluar?")) {
            await supabase.auth.signOut()
            router.replace('/login')
          }
        }}
        className="flex items-center justify-center md:justify-start gap-3 p-4 bg-transparent text-red-400 rounded-2xl font-black text-[10px] tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all border border-red-500/20 uppercase"
      >
        <span>🚪</span> 
        <span className="hidden md:block">Keluar</span>
      </button>
    </aside>
  )
}