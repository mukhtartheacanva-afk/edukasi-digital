 'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

export default function MateriPage() {
  const [loading, setLoading] = useState(true)
  const [lessons, setLessons] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('Semua') 
  const router = useRouter()

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8 // Kita naikkan ke 8 supaya pas dengan baris isi 4 card

  // Fungsi ambil Thumbnail YouTube Otomatis
  const getYouTubeThumbnail = (url: string) => {
    try {
      const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      const videoId = (match && match[2].length === 11) ? match[2] : null;
      return videoId 
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` 
        : 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop';
    } catch (e) {
      return 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop';
    }
  }

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_approved')
        .eq('id', user.id)
        .single();

      if (!profile?.is_approved && user.email !== 'mukhtartheacanva@gmail.com') {
        alert("Akun Anda sedang menunggu persetujuan Admin.");
        router.replace('/login');
        return;
      }

      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .order('created_at', { ascending: false })

      if (lessonsData) setLessons(lessonsData)
      setLoading(false)
    }

    checkUserAndFetchData()
  }, [router])

  const categories = ['Semua', ...Array.from(new Set(lessons.map(l => l.category).filter(Boolean)))]

  const filteredData = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lesson.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'Semua' || lesson.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage))
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e3d0ba] text-amber-950 font-black italic uppercase tracking-tighter">
        <div className="animate-bounce mr-3 text-2xl">📚</div> Mempersiapkan Kelas...
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-[#e3d0ba]">
      <Sidebar />

      {/* Main Content: Jarak ml-20 md:ml-72 agar mepet sidebar dinamis */}
      <main className="flex-grow ml-20 md:ml-72 p-4 md:p-8 pb-32 transition-all duration-300 relative min-h-screen">
        
        {/* Wood Texture Background */}
        <div 
          className="fixed inset-0 z-0 opacity-100 pointer-events-none" 
          style={{ 
            backgroundImage: `url('https://www.transparenttextures.com/patterns/wood-pattern.png')`,
            backgroundRepeat: 'repeat'
          }}
        />

        <div className="relative z-10 max-w-[1600px] mx-auto">
          <header className="mb-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-amber-950 tracking-tight italic uppercase">Katalog Materi 🚀</h1>
              <p className="text-amber-900 mt-1 font-bold text-[9px] uppercase tracking-[0.2em] opacity-60">
                Temukan materi terbaik untuk meningkatkan keahlianmu.
              </p>
            </div>

            <div className="relative w-full xl:w-80">
              <span className="absolute inset-y-0 left-4 flex items-center opacity-40">🔍</span>
              <input 
                type="text"
                placeholder="Cari materi..."
                className="w-full pl-10 pr-4 py-3.5 bg-white/50 backdrop-blur-md border border-white/40 rounded-2xl shadow-xl focus:bg-white outline-none transition-all text-black font-black text-[10px] uppercase"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </header>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-10">
            <div className="flex items-center gap-3 bg-white/30 backdrop-blur-md p-2 px-4 rounded-xl border border-white/40 shadow-sm">
              <span className="text-[8px] font-black text-amber-950 uppercase tracking-widest">Kategori:</span>
              <select 
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer text-amber-950"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="px-4 py-2.5 bg-amber-950/90 text-amber-50 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">
              {filteredData.length} Hasil
            </div>
          </div>

          {currentItems.length > 0 ? (
            <>
              {/* Grid 4 Kolom: 2xl:grid-cols-4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 md:gap-6">
                {currentItems.map((lesson, index) => (
                  <div 
                    key={lesson.id} 
                    className="group bg-white/60 backdrop-blur-xl rounded-[2.2rem] p-2.5 shadow-2xl border border-white/30 hover:border-amber-600 transition-all duration-500 flex flex-col h-full overflow-hidden"
                  >
                    {/* Thumbnail Area */}
                    <div className="aspect-video w-full bg-amber-900 rounded-[1.8rem] mb-3 overflow-hidden relative shadow-inner">
                      <img 
                        src={getYouTubeThumbnail(lesson.video_url)} 
                        alt={lesson.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-amber-950/40 via-transparent to-transparent" />
                      
                      {/* Badge Nomor Materi */}
                      <span className="absolute bottom-3 left-5 z-10 text-3xl font-black text-white/20 italic">
                        #{(currentPage - 1) * itemsPerPage + index + 1}
                      </span>
                      
                      {/* Label Kategori di Atas Gambar */}
                      <div className="absolute top-3 right-3 bg-amber-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[7px] font-black text-amber-100 uppercase tracking-widest border border-white/10">
                        {lesson.category || 'Umum'}
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="px-3 pb-4 flex-grow flex flex-col">
                      <h3 className="text-sm md:text-base font-black text-amber-950 mb-1 group-hover:text-amber-800 transition-colors leading-tight uppercase italic tracking-tighter line-clamp-1">
                        {lesson.title}
                      </h3>
                      <p className="text-amber-900/60 text-[9px] leading-relaxed line-clamp-2 mb-4 font-bold h-7 italic">
                        {lesson.description || "Tonton video pembelajaran premium ini sekarang."}
                      </p>
                      
                      <button 
                        onClick={() => router.push(`/materi/${lesson.id}`)}
                        className="mt-auto w-full py-3.5 bg-amber-950 text-amber-50 rounded-2xl font-black text-[8px] tracking-[0.3em] hover:bg-amber-800 transition-all active:scale-95 uppercase shadow-xl border border-white/10"
                      >
                        Mulai Belajar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-16 flex justify-center items-center gap-6">
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                  className="px-6 py-2.5 bg-white/40 backdrop-blur-sm border border-white/50 rounded-xl text-[9px] font-black disabled:opacity-20 hover:bg-amber-100 transition-all shadow-md text-amber-950 uppercase"
                >
                  Prev
                </button>
                <span className="text-[9px] font-black text-amber-950 uppercase tracking-[0.3em]">
                  {currentPage} / {totalPages}
                </span>
                <button 
                  disabled={currentPage >= totalPages} 
                  onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                  className="px-6 py-2.5 bg-white/40 backdrop-blur-sm border border-white/50 rounded-xl text-[9px] font-black disabled:opacity-20 hover:bg-amber-100 transition-all shadow-md text-amber-950 uppercase"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-[3rem] p-20 text-center border-2 border-dashed border-amber-900/10">
              <div className="text-6xl mb-4 opacity-30">🏜️</div>
              <p className="text-amber-950 font-black text-[10px] uppercase tracking-[0.4em] opacity-40 italic">Materi tidak ditemukan</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}