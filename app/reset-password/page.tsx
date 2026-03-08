'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      alert(error.message)
    } else {
      alert('Password berhasil diganti! Silakan login kembali.')
      router.push('/login')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-black">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-10 border border-gray-100">
        <h1 className="text-2xl font-black mb-6 tracking-tighter">PASSWORD BARU 🔒</h1>
        <form onSubmit={handleUpdate} className="space-y-4">
          <input 
            type="password" required placeholder="Masukkan password baru" value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all"
          />
          <button 
            disabled={loading}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-blue-600 transition-all disabled:opacity-50"
          >
            {loading ? 'MENYIMPAN...' : 'UPDATE PASSWORD'}
          </button>
        </form>
      </div>
    </div>
  )
}