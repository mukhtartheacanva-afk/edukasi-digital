'use client'
import { useEffect, useState, useRef } from 'react' // Tambah useRef
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

export default function PeraturanPage() {
  const [regs, setRegs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // State Search & Filter
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('Semua')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false) // State untuk buka tutup dropdown
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // State Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5 

  useEffect(() => {
    fetchData()
    // Menutup dropdown jika klik di luar area
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchData = async () => {
    const { data } = await supabase.from('regulations').select('*').order('created_at', { ascending: false })
    if (data) setRegs(data)
    setLoading(false)
  }

  // --- LOGIKA FILTER ---
  const categories = ['Semua', ...Array.from(new Set(regs.map(r => r.category).filter(Boolean)))]

  const filteredData = regs.filter(r => {
    const matchesSearch = r.title?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'Semua' || r.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // --- LOGIKA PAGINATION ---
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage))
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)

  if (loading) return (
    <div className="flex justify-center items-center h-screen font-black text-[#2d5a27] bg-[#f0f4f0]">
      <div className="animate-bounce flex flex-col items-center gap-4">
        <span className="text-4xl">📂</span>
        <span className="tracking-widest uppercase text-xs">Menyusun Dokumen...</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex text-[#4a3728]">
      <Sidebar />
      
      {/* MAIN CONTAINER */}
      <main className="flex-grow ml-20 md:ml-72 p-4 md:p-10 pb-32 transition-all duration-300 relative min-h-screen bg-[#f0f4f0]">
        
        {/* Layer Background Halus */}
        <div 
          className="fixed inset-0 z-0 opacity-[0.04] pointer-events-none" 
          style={{ 
            backgroundImage: `url('https://www.transparenttextures.com/patterns/leaf.png')`,
            backgroundRepeat: 'repeat'
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8 border-b-4 border-[#e5d3b3] pb-10">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-5xl">📖</span>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[#2d5a27]">Arsip Regulasi</h1>
              </div>
              <p className="text-[#8b7355] font-bold text-xs uppercase tracking-[0.2em] ml-1">Pusat dokumen resmi dan pedoman digital SI-DUGI.</p>
            </div>

            {/* Search Bar (Wood Tone) */}
            <div className="relative w-full md:w-96 group">
              <input 
                type="text" 
                placeholder="Cari judul peraturan..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full p-5 pl-14 bg-white rounded-2xl shadow-md border-2 border-[#e5d3b3] outline-none focus:border-[#2d5a27] font-bold text-sm transition-all text-[#4a3728] placeholder:text-[#cbb493]"
              />
              <span className="absolute left-5 top-5 text-xl group-focus-within:scale-110 transition-transform">🔍</span>
            </div>
          </header>

          {/* Filter Area - CUSTOM DROPDOWN */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4" ref={dropdownRef}>
              <span className="text-[10px] font-black text-[#8b7355] uppercase tracking-widest">Kategori:</span>
              
              <div className="relative w-64">
                {/* Trigger Button */}
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between bg-[#fdf8f1] p-3 px-6 rounded-2xl border-2 border-[#e5d3b3] shadow-sm text-xs font-black uppercase text-[#2d5a27] transition-all hover:border-[#2d5a27]"
                >
                  <span className="truncate">{filterCategory}</span>
                  <span className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}>▼</span>
                </button>

                {/* Dropdown Menu (Custom) */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white border-2 border-[#e5d3b3] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar font-bold">
                      {categories.map((cat) => (
                        <div 
                          key={cat}
                          onClick={() => {
                            setFilterCategory(cat);
                            setCurrentPage(1);
                            setIsDropdownOpen(false);
                          }}
                          className={`p-4 px-6 text-[11px] uppercase cursor-pointer transition-colors border-b border-[#f3e9dc] last:border-none
                            ${filterCategory === cat 
                              ? 'bg-[#2d5a27] text-white' 
                              : 'hover:bg-[#f3e9dc] text-[#4a3728]'
                            }`}
                        >
                          {cat}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 bg-[#2d5a27] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">
              {filteredData.length} Dokumen Tersedia
            </div>
          </div>

          {/* Daftar Dokumen (Table Style) */}
          <div className="bg-[#fdf8f1] rounded-[3rem] shadow-xl border-2 border-[#e5d3b3] overflow-hidden">
            <div className="overflow-x-auto text-black">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#2d5a27] text-[10px] font-black uppercase text-white tracking-widest">
                  <tr>
                    <th className="p-8">Nama Dokumen</th>
                    <th className="p-8">Kategori</th>
                    <th className="p-8 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#f3e9dc]">
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <tr key={item.id} className="hover:bg-white transition-all group">
                        <td className="p-8">
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-red-50 text-red-600 flex flex-col items-center justify-center rounded-2xl font-black text-[9px] group-hover:scale-110 transition-transform shadow-sm border border-red-100 uppercase tracking-tighter">
                              <span className="text-xl mb-[-4px]">📄</span>
                              PDF
                            </div>
                            <div>
                              <p className="font-black text-base text-[#4a3728] leading-tight group-hover:text-[#2d5a27] transition-colors uppercase italic">{item.title}</p>
                              <p className="text-[10px] text-[#8b7355] font-bold mt-2 uppercase flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-[#2d5a27] rounded-full"></span>
                                Rilis: {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-8">
                          <span className="px-4 py-1.5 bg-[#e5d3b3]/40 text-[#4a3728] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#e5d3b3]">
                            {item.category || 'Umum'}
                          </span>
                        </td>
                        <td className="p-8 text-right text-black">
                          <div className="flex justify-end gap-3 text-black">
                            <a 
                              href={item.file_url} 
                              target="_blank" 
                              className="px-6 py-3 bg-white border-2 border-[#e5d3b3] rounded-xl text-[10px] font-black uppercase hover:border-[#2d5a27] hover:text-[#2d5a27] transition-all shadow-sm"
                            >
                              Buka
                            </a>
                            <a 
                              href={item.file_url} 
                              download 
                              className="px-6 py-3 bg-[#2d5a27] text-white rounded-xl text-[10px] font-black uppercase shadow-md hover:bg-[#1f3f1b] transition-all active:scale-95"
                            >
                              Unduh
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-24 text-center">
                        <div className="opacity-20 text-6xl mb-4 grayscale">📂</div>
                        <p className="text-[#8b7355] font-black text-xs uppercase tracking-[0.4em] italic">Arsip tidak ditemukan</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION CONTROL */}
            <div className="p-8 bg-[#f3e9dc]/50 flex justify-center items-center gap-10 border-t-2 border-[#f3e9dc]">
              <button 
                disabled={currentPage === 1} 
                onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                className="px-8 py-3 bg-white border-2 border-[#e5d3b3] rounded-2xl text-[10px] font-black disabled:opacity-30 hover:border-[#2d5a27] hover:text-[#2d5a27] transition-all shadow-sm uppercase flex items-center gap-2"
              >
                ← Prev
              </button>
              <div className="flex items-center gap-3 text-black">
                <span className="w-10 h-10 flex items-center justify-center bg-[#2d5a27] text-white rounded-full font-black text-sm shadow-md">{currentPage}</span>
                <span className="text-[#8b7355] font-black text-[10px] uppercase opacity-40 text-black">dari {totalPages}</span>
              </div>
              <button 
                disabled={currentPage >= totalPages} 
                onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                className="px-8 py-3 bg-white border-2 border-[#e5d3b3] rounded-2xl text-[10px] font-black disabled:opacity-30 hover:border-[#2d5a27] hover:text-[#2d5a27] transition-all shadow-sm uppercase flex items-center gap-2"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}