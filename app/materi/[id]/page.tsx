 'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DetailMateriPage() {
  const { id } = useParams()
  const [lesson, setLesson] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchDetail = async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error || !data) {
        router.push('/materi')
        return
      }
      
      setLesson(data)
      setLoading(false)
    }
    fetchDetail()
  }, [id, router])

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#e3d0ba] text-amber-950 font-black italic">
       <div className="animate-bounce mr-2 text-2xl">🚀</div> Membuka Materi...
    </div>
  )

  return (
    <div className="min-h-screen relative pb-20 text-amber-950">
      {/* Background Kayu Jati */}
      <div 
        className="fixed inset-0 z-[-1]" 
        style={{ 
          backgroundImage: `url('https://www.transparenttextures.com/patterns/wood-pattern.png')`,
          backgroundColor: '#e3d0ba',
          backgroundRepeat: 'repeat'
        }}
      />

      {/* Header / Navigasi Atas (Glass Style) */}
      <div className="sticky top-0 z-20 border-b border-white/20 bg-white/40 backdrop-blur-xl p-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center">
          <button 
            onClick={() => router.push('/materi')} 
            className="flex items-center text-amber-950 font-black text-xs uppercase tracking-widest hover:translate-x-[-4px] transition-transform"
          >
            <span className="mr-2 text-xl">←</span> Kembali ke Katalog
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8 relative z-10">
        {/* Judul Materi & Badge */}
        <div className="mb-8">
          <span className="bg-amber-950 text-amber-100 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg">
            Modul {lesson.order_index || '1'}
          </span>
          <h1 className="text-3xl md:text-5xl font-black mt-5 text-amber-950 leading-tight italic uppercase tracking-tighter drop-shadow-sm">
            {lesson.title}
          </h1>
        </div>
        
        {/* Video Player Container dengan Efek Bingkai Kayu Tua */}
        <div className="aspect-video w-full bg-black rounded-[2.5rem] overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] border-[12px] border-amber-900/20 mb-10">
          <iframe 
            className="w-full h-full" 
            src={lesson.video_url} 
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Kolom Kiri: Deskripsi (Glassmorphism Card) */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/50 h-full">
              <h2 className="font-black text-xl mb-6 text-amber-950 flex items-center uppercase italic tracking-tight">
                <span className="mr-3 text-2xl">📝</span> Deskripsi Materi
              </h2>
              <div className="h-[2px] w-20 bg-amber-900/20 mb-6"></div>
              <p className="text-amber-900 leading-relaxed whitespace-pre-line text-lg font-bold opacity-90">
                {lesson.description || "Belum ada penjelasan detail untuk materi ini."}
              </p>
            </div>
          </div>

          {/* Kolom Kanan: Tombol Subscribe & Aksi */}
          <div className="lg:col-span-1 space-y-6">
            {/* Box Subscribe YouTube (Tema Gelap Kayu) */}
            <div className="bg-amber-950 p-8 rounded-[2.5rem] text-amber-100 shadow-2xl border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              
              <div className="relative z-10">
                <h3 className="font-black text-xl mb-3 uppercase italic tracking-tighter">Support Mentor</h3>
                <p className="text-amber-100/70 text-[11px] font-bold mb-8 leading-relaxed uppercase tracking-widest">
                  Akses update materi terbaru lebih cepat lewat YouTube.
                </p>
                <a 
                  href="https://www.youtube.com/channel/UCVjyVWwWlaET5cz8EIw6Gjw?sub_confirmation=1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full py-4 bg-red-500 text-amber-950 text-center rounded-2xl font-black text-[10px] tracking-[0.2em] hover:bg-white transition-all shadow-xl active:scale-95 uppercase"
                >
                  SUBSCRIBE SEKARANG
                </a>
              </div>
            </div>

            {/* Tombol Selesai */}
            <button className="w-full py-5 bg-white/80 backdrop-blur-md text-amber-950 border border-amber-900/10 rounded-[2rem] font-black text-[11px] tracking-[0.2em] uppercase hover:bg-amber-950 hover:text-white transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 group">
              Tandai Selesai <span className="group-hover:scale-125 transition-transform text-lg">✅</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}