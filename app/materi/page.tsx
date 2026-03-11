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
  const itemsPerPage = 8 

  // Fungsi ambil Thumbnail YouTube Otomatis (Tetap Aman)
  const getYouTubeThumbnail = (url: string) => {
    try {
      const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      const videoId = (match && match[2].length === 11) ? match[2] : null;
      return videoId 
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` 
        : 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop';
    } catch (e) {
      return 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop';
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
      <div className="flex min-h-screen items-center justify-center bg-[#f0f4f0] text-green-900 font-black italic uppercase tracking-tighter">
        <div className="animate-bounce mr-3 text-2xl">🌱</div> Membuka Gerbang Hutan Ilmu...
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-[#f0f4f0] overflow-x-hidden">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-grow ml-20 md:ml-72 p-2 md:p-10 pb-32 transition-all duration-300 relative min-h-screen w-full">
        
        {/* Subtle Leaf/Nature Texture Background Overlay */}
        <div 
          className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" 
          style={{ 
            backgroundImage: `url('https://www.transparenttextures.com/patterns/leaf.png')`,
            backgroundRepeat: 'repeat'
          }}
        />

        <div className="relative z-10 max-w-full mx-auto overflow-hidden">
          {/* Header Section dengan Nuansa Hijau & Kayu */}
          {/* Header Section yang Lebih Tipis */}
          <header className="mb-6 flex flex-col xl:flex-row xl:items-end justify-between gap-3 border-b-2 border-[#e5d3b3] pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl md:text-4xl">🌳</span>
                <h1 className="text-xl md:text-5xl font-black text-[#2d5a27] tracking-tight uppercase">
                  Hutan Materi
                </h1>
              </div>
              <p className="text-[#8b7355] font-bold text-[8px] md:text-xs uppercase tracking-[0.1em] ml-1">
                Ekosistem Digital SI-DUGI.
              </p>
            </div>

            {/* Search Bar yang Lebih Pendek */}
            <div className="relative w-full xl:w-80 group">
              <span className="absolute inset-y-0 left-3 flex items-center text-xs">🔍</span>
              <input 
                type="text"
                placeholder="Cari ilmu..."
                className="w-full pl-10 pr-4 py-2 bg-white rounded-xl shadow-sm border-2 border-[#e5d3b3] focus:border-[#2d5a27] outline-none text-[10px] md:text-sm font-bold text-[#4a3728]"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </header>

          {/* Filter & Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-10">
            <div className="flex items-center gap-3 bg-[#fdf8f1] p-3 px-4 rounded-2xl border-2 border-[#e5d3b3] shadow-sm">
              <span className="text-[10px] font-black text-[#8b7355] uppercase tracking-widest">Kategori:</span>
              <select 
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                className="bg-transparent text-sm font-black uppercase outline-none cursor-pointer text-[#2d5a27] focus:ring-0"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="px-6 py-3 bg-[#2d5a27] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
              <span className="animate-pulse text-green-300">●</span> {filteredData.length} Materi Tersedia
            </div>
          </div>

          {currentItems.length > 0 ? (
            <>
              {/* Grid 4 Kolom dengan Card Bergaya Kayu/Alam */}
              {/* Grid yang lebih rapat */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-8">
                {currentItems.map((lesson) => (
                  <div 
                    key={lesson.id} 
                    className="group bg-[#fdf8f1] rounded-[1.5rem] p-2 md:p-4 shadow-lg border-2 border-[#e5d3b3] hover:border-[#2d5a27] transition-all flex flex-col h-full overflow-hidden"
                  >
                    {/* Thumbnail lebih kecil */}
                    <div className="aspect-video w-full bg-[#e5d3b3] rounded-[1rem] mb-2 overflow-hidden relative border-2 border-white">
                      <img 
                        src={getYouTubeThumbnail(lesson.video_url)} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1.5 right-1.5 bg-[#2d5a27] text-white px-2 py-0.5 rounded-full text-[6px] font-black uppercase tracking-widest">
                        {lesson.category || 'Umum'}
                      </div>
                    </div>

                    {/* Teks dengan ukuran font lebih kecil (Efek Zoom Out) */}
                    <div className="px-1 pb-1 flex-grow flex flex-col">
                      <h3 className="text-[10px] md:text-lg font-black text-[#4a3728] mb-1 leading-tight uppercase line-clamp-2">
                        {lesson.title}
                      </h3>
                      <p className="text-[#8b7355] text-[8px] md:text-[11px] leading-tight line-clamp-2 mb-3 font-medium italic">
                        {lesson.description || "Tonton video pembelajaran premium ini."}
                      </p>
                      
                      <button 
                        onClick={() => router.push(`/materi/${lesson.id}`)}
                        className="mt-auto w-full py-2 bg-[#2d5a27] text-white rounded-xl font-black text-[8px] tracking-widest uppercase shadow-md flex items-center justify-center gap-1"
                      >
                        Mulai Belajar <span>🌿</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Estetik */}
              <div className="mt-20 flex justify-center items-center gap-8">
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                  className="px-8 py-3 bg-white border-2 border-[#e5d3b3] rounded-2xl text-[10px] font-black disabled:opacity-30 hover:bg-[#fdf8f1] hover:border-[#2d5a27] transition-all shadow-sm text-[#4a3728] uppercase flex items-center gap-2"
                >
                  ← Prev
                </button>
                <div className="flex items-center gap-2">
                   <span className="w-10 h-10 flex items-center justify-center bg-[#2d5a27] text-white rounded-full font-black text-sm shadow-md">
                     {currentPage}
                   </span>
                   <span className="text-[#8b7355] font-black text-xs uppercase opacity-40">dari {totalPages}</span>
                </div>
                <button 
                  disabled={currentPage >= totalPages} 
                  onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                  className="px-8 py-3 bg-white border-2 border-[#e5d3b3] rounded-2xl text-[10px] font-black disabled:opacity-30 hover:bg-[#fdf8f1] hover:border-[#2d5a27] transition-all shadow-sm text-[#4a3728] uppercase flex items-center gap-2"
                >
                  Next →
                </button>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="bg-white/50 backdrop-blur-md rounded-[4rem] p-24 text-center border-4 border-dashed border-[#e5d3b3]">
              <div className="text-7xl mb-6 opacity-40 grayscale">🌵</div>
              <h3 className="text-[#4a3728] font-black text-xl uppercase tracking-widest">Belum Ada Tunas Ilmu</h3>
              <p className="text-[#8b7355] mt-2 font-bold italic">Materi yang kamu cari tidak ditemukan di hutan ini.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}