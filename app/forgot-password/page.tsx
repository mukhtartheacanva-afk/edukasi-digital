 'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      alert(error.message)
    } else {
      setMessage('Cek email kamu! Link reset password sudah dikirim.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-black">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-10 border border-gray-100">
        <h1 className="text-2xl font-black mb-2 tracking-tighter">LUPA PASSWORD? 🔑</h1>
        <p className="text-gray-400 text-sm mb-8 font-medium">Tenang, masukkan emailmu di bawah untuk reset.</p>

        {message ? (
          <div className="bg-green-50 text-green-600 p-4 rounded-2xl font-bold text-sm mb-6">
            {message}
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <input 
              type="email" required placeholder="nama@email.com" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all"
            />
            <button 
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {loading ? 'MENGIRIM...' : 'KIRIM LINK RESET'}
            </button>
          </form>
        )}
        
        <Link href="/login" className="block text-center mt-8 text-sm font-bold text-blue-600 hover:underline">
          Kembali ke Login
        </Link>
      </div>
    </div>
  )
}