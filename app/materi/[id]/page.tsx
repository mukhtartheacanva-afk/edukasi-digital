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
    <div className="flex min-h-screen items-center justify-center bg-[#f0f4f0] text-[#2d5a27] font-black italic">
       <div className="animate-bounce mr-3 text-3xl">🌿</div> Membuka Gerbang Ilmu...
    </div>
  )

  return (
    <div className="min-h-screen relative pb-20 text-[#4a3728]">
      {/* Background Daun & Alam (Sejuk) */}
      <div 
        className="fixed inset-0 z-[-1]" 
        style={{ 
          backgroundImage: `url('https://www.transparenttextures.com/patterns/leaf.png')`,
          backgroundColor: '#f0f4f0',
          backgroundRepeat: 'repeat',
          opacity: 0.4
        }}
      />

      {/* Header / Navigasi Atas (Glass Style - Kayu Muda) */}
      <div className="sticky top-0 z-20 border-b-4 border-[#e5d3b3] bg-white/60 backdrop-blur-xl p-5 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center">
          <button 
            onClick={() => router.push('/materi')} 
            className="flex items-center text-[#2d5a27] font-black text-xs uppercase tracking-widest hover:translate-x-[-6px] transition-transform group"
          >
            <span className="mr-3 text-2xl group-hover:scale-125 transition-transform">🔙</span> Kembali ke Hutan Materi
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-10 relative z-10">
        {/* Judul Materi & Badge (Tema Kayu) */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-[#2d5a27] text-white text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-[0.3em] shadow-lg border border-green-400/20">
              Modul {lesson.order_index || '1'}
            </span>
            <span className="bg-[#e5d3b3] text-[#4a3728] text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-[0.3em] shadow-sm">
              {lesson.category || 'Umum'}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#4a3728] leading-tight uppercase tracking-tighter drop-shadow-sm">
            {lesson.title}
          </h1>
          <div className="h-2 w-24 bg-green-600 rounded-full mt-4"></div>
        </div>
        
        {/* Video Player Container dengan Frame Kayu Solid */}
        <div className="aspect-video w-full bg-black rounded-[3rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] border-[12px] border-[#e5d3b3] mb-12 group transition-all hover:border-[#2d5a27]">
          <iframe 
            className="w-full h-full" 
            src={lesson.video_url} 
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Kolom Kiri: Deskripsi (Papan Kayu Terang) */}
          <div className="lg:col-span-2">
            <div className="bg-[#fdf8f1] p-8 md:p-12 rounded-[3rem] shadow-xl border-2 border-[#e5d3b3] h-full relative overflow-hidden">
              {/* Dekorasi Pojok */}
              <div className="absolute top-0 right-0 p-6 opacity-5 text-6xl italic font-black text-[#2d5a27]">SI-DUGI</div>
              
              <h2 className="font-black text-2xl mb-8 text-[#2d5a27] flex items-center uppercase tracking-tight">
                <span className="mr-4 text-3xl">📖</span> Detail Pembelajaran
              </h2>
              <div className="h-[1px] w-full bg-[#e5d3b3] mb-8"></div>
              <p className="text-[#4a3728] leading-relaxed whitespace-pre-line text-lg font-medium opacity-90 italic">
                {lesson.description || "Belum ada penjelasan detail untuk materi ini. Silakan tonton video di atas untuk memahami materi sepenuhnya."}
              </p>
            </div>
          </div>

          {/* Kolom Kanan: Aksi & Support */}
          <div className="lg:col-span-1 space-y-8">
            {/* Box Subscribe YouTube (Hutan Gelap) */}
            <div className="bg-[#1f3f1b] p-8 rounded-[3rem] text-white shadow-2xl border-4 border-[#2d5a27] relative overflow-hidden group">
              <div className="absolute -bottom-4 -right-4 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
                <span className="text-8xl">🎬</span>
              </div>
              
              <div className="relative z-10 text-center">
                <h3 className="font-black text-xl mb-4 uppercase tracking-widest text-green-300">Dukung Mentor</h3>
                <p className="text-green-100/60 text-[10px] font-bold mb-8 leading-relaxed uppercase tracking-widest">
                  Klik subscribe untuk terus mendapatkan update ilmu terbaru dari channel kami.
                </p>
                <a 
                  href="https://www.youtube.com/channel/UCVjyVWwWlaET5cz8EIw6Gjw?sub_confirmation=1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full py-5 bg-[#ff0000] text-white text-center rounded-2xl font-black text-xs tracking-[0.2em] hover:bg-white hover:text-red-600 transition-all shadow-xl active:scale-95 uppercase"
                >
                  SUBSCRIBE YOUTUBE
                </a>
              </div>
            </div>

            {/* Tombol Selesai (Kayu Jati Muda) */}
            <button className="w-full py-6 bg-[#2d5a27] text-white rounded-[2.5rem] font-black text-xs tracking-[0.3em] uppercase hover:bg-[#1f3f1b] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 group">
              Selesai Belajar <span className="group-hover:rotate-12 transition-transform text-2xl">🌲</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}