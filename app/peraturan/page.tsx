 'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

export default function PeraturanPage() {
  const [regs, setRegs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // State Search & Filter
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('Semua')
  
  // State Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5 

  useEffect(() => {
    fetchData()
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
    <div className="flex justify-center items-center h-screen font-black text-amber-900 bg-[#e3d0ba]">
      <div className="animate-bounce">MEMUAT DOKUMEN... 📂</div>
    </div>
  )

  return (
    <div className="min-h-screen flex text-black">
      <Sidebar />
      
      {/* MAIN CONTAINER DENGAN MOTIF KAYU */}
      <main className="flex-grow ml-20 md:ml-72 p-4 md:p-8 pb-32 transition-all duration-300 relative min-h-screen">
        {/* Layer Background Kayu (Fixed) */}
        <div 
          className="fixed inset-0 z-[-1]" 
          style={{ 
            backgroundImage: `url('https://www.transparenttextures.com/patterns/wood-pattern.png')`,
            backgroundColor: '#e3d0ba',
            backgroundRepeat: 'repeat'
          }}
        />
        {/* Layer Overlay Halus */}
        <div className="fixed inset-0 z-[-1] bg-white/10 pointer-events-none" />

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 relative z-10">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter drop-shadow-sm text-amber-950">Pusat Peraturan 📂</h1>
            <p className="text-amber-900 font-bold text-xs uppercase mt-1 tracking-widest">Cari dan unduh dokumen resmi dengan mudah.</p>
          </div>

          {/* Search Bar (Glass Style) */}
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="Cari judul peraturan..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full p-4 pl-12 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 outline-none focus:bg-white font-bold text-xs transition-all"
            />
            <span className="absolute left-4 top-4">🔍</span>
          </div>
        </header>

        {/* Filter Area */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8 relative z-10 font-bold">
          <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md p-2 px-4 rounded-2xl border border-white/50 shadow-lg w-full md:w-auto">
            <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Kategori:</span>
            <div className="relative flex-grow">
              <select 
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                className="appearance-none w-full bg-transparent pr-8 text-[11px] font-black uppercase outline-none cursor-pointer text-amber-900"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[8px]">▼</span>
            </div>
          </div>

          <div className="px-4 py-3 bg-amber-900 text-amber-100 rounded-2xl text-[10px] font-black uppercase whitespace-nowrap shadow-lg">
            {filteredData.length} Dokumen Ditemukan
          </div>
        </div>

        {/* Daftar Dokumen (Glass Table) */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden relative z-10">
          <table className="w-full text-left border-collapse">
            <thead className="bg-amber-950 text-[10px] font-black uppercase text-amber-100 tracking-widest">
              <tr>
                <th className="p-6">Detail Dokumen</th>
                <th className="p-6">Kategori</th>
                <th className="p-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100 font-bold">
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-white/40 transition-all group font-bold">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-100 text-red-600 flex items-center justify-center rounded-xl font-black text-[10px] group-hover:scale-110 transition-transform shadow-sm border border-red-200">PDF</div>
                        <div>
                          <p className="font-black text-sm text-amber-950 leading-tight">{item.title}</p>
                          <p className="text-[10px] text-amber-700 font-bold mt-1 uppercase">Diunggah: {new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-amber-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-6 text-right space-x-2">
                      <a href={item.file_url} target="_blank" className="inline-block px-4 py-2 bg-white/80 border border-amber-200 rounded-xl text-[10px] font-black uppercase hover:bg-white transition-colors shadow-sm">Pratinjau</a>
                      <a href={item.file_url} download className="inline-block px-4 py-2 bg-amber-900 text-white rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-amber-800 transition-all active:scale-95">Unduh</a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-20 text-center text-amber-900 font-black text-xs uppercase tracking-widest">Tidak ada dokumen yang ditemukan</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* PAGINATION CONTROL */}
          <div className="p-6 bg-amber-900/5 flex justify-center items-center gap-6 border-t border-amber-100">
            <button 
              disabled={currentPage === 1} 
              onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({top: 0, behavior: 'smooth'}); }}
              className="px-5 py-2 bg-white/80 border border-amber-200 rounded-xl text-[10px] font-black disabled:opacity-30 hover:bg-white transition-all shadow-sm"
            >
              PREV
            </button>
            <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Halaman {currentPage} / {totalPages}</span>
            <button 
              disabled={currentPage >= totalPages} 
              onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({top: 0, behavior: 'smooth'}); }}
              className="px-5 py-2 bg-white/80 border border-amber-200 rounded-xl text-[10px] font-black disabled:opacity-30 hover:bg-white transition-all shadow-sm"
            >
              NEXT
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}