'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Data State
  const [users, setUsers] = useState<any[]>([])
  const [lessons, setLessons] = useState<any[]>([])
  const [regs, setRegs] = useState<any[]>([])

  // State Dropdown Custom
  const [isMatDropOpen, setIsMatDropOpen] = useState(false)
  const [isRegDropOpen, setIsRegDropOpen] = useState(false)
  const matDropRef = useRef<HTMLDivElement>(null)
  const regDropRef = useRef<HTMLDivElement>(null)

  // State Pencarian & Pagination
  const itemsPerPage = 5
  const [searchUser, setSearchUser] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchMateri, setSearchMateri] = useState('')
  const [pageMateri, setPageMateri] = useState(1)
  const [searchReg, setSearchReg] = useState('')
  const [pageReg, setPageReg] = useState(1)

  // Modal & Edit State
  const [editingItem, setEditingItem] = useState<any>(null)
  const [editType, setEditType] = useState<'lesson' | 'reg' | null>(null)

  // Form State
  const [materiTitle, setMateriTitle] = useState('')
  const [materiUrl, setMateriUrl] = useState('')
  const [materiDesc, setMateriDesc] = useState('')
  const [regTitle, setRegTitle] = useState('')
  const [regCategory, setRegCategory] = useState('')
  const [regFileUrl, setRegFileUrl] = useState('')
  const [materiCategory, setMateriCategory] = useState('')

  // Filter Kategori
  const [filterMateriCat, setFilterMateriCat] = useState('Semua')
  const [filterRegCat, setFilterRegCat] = useState('Semua')

  useEffect(() => {
    setMounted(true)
    const initAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email !== 'mukhtartheacanva@gmail.com') {
        router.replace('/materi')
        return
      }
      await fetchData()
      setLoading(false)
    }
    if (mounted) initAdmin()

    const handleClick = (e: MouseEvent) => {
      if (matDropRef.current && !matDropRef.current.contains(e.target as Node)) setIsMatDropOpen(false)
      if (regDropRef.current && !regDropRef.current.contains(e.target as Node)) setIsRegDropOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [mounted, router])

  const fetchData = async () => {
    const { data: userData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    const { data: lessonData } = await supabase.from('lessons').select('*').order('created_at', { ascending: false })
    const { data: regData } = await supabase.from('regulations').select('*').order('created_at', { ascending: false })
    
    if (userData) setUsers(userData)
    if (lessonData) setLessons(lessonData)
    if (regData) setRegs(regData)
  }

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>, type: 'materi' | 'reg') => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (event) => {
      const content = event.target?.result as string
      const lines = content.split('\n').filter(line => line.trim() !== '') 
      let dataToInsert: any[] = []
      if (type === 'materi') {
        dataToInsert = lines.map(line => {
          const [title, video_url, description, category] = line.split(',')
          return { title: title?.trim(), video_url: video_url?.trim(), description: description?.trim(), category: category?.trim() || 'Umum' }
        }).filter(item => item.title && item.video_url)
      } else {
        dataToInsert = lines.map(line => {
          const [title, category, file_url] = line.split(',')
          return { title: title?.trim(), category: category?.trim(), file_url: file_url?.trim() }
        }).filter(item => item.title && item.category && item.file_url)
      }
      if (dataToInsert.length > 0) {
        const table = type === 'materi' ? 'lessons' : 'regulations'
        const { error } = await supabase.from(table).insert(dataToInsert)
        if (error) alert("Gagal Import: " + error.message)
        else { alert(`Berhasil Import ${dataToInsert.length} data ${type}! 🚀`); fetchData(); }
      }
      e.target.value = '' 
    }
    reader.readAsText(file)
  }

  const handleDelete = async (table: string, id: string) => {
    if (confirm("Hapus data ini secara permanen?")) {
      await supabase.from(table).delete().eq('id', id)
      fetchData()
    }
  }

  const handleApprove = async (id: string) => {
    await supabase.from('profiles').update({ is_approved: true }).eq('id', id)
    fetchData()
  }

  const submitMateri = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { title: materiTitle, video_url: materiUrl, description: materiDesc, category: materiCategory || 'Umum' }
    if (editingItem && editType === 'lesson') await supabase.from('lessons').update(payload).eq('id', editingItem.id)
    else await supabase.from('lessons').insert([payload])
    resetForms(); fetchData(); alert("Berhasil disimpan! ✅")
  }

  const submitReg = async (e: React.FormEvent) => {
    e.preventDefault()
    const finalCategory = regCategory.trim()
    if (editingItem && editType === 'reg') {
      await supabase.from('regulations').update({ title: regTitle, category: finalCategory, file_url: regFileUrl }).eq('id', editingItem.id)
    } else {
      await supabase.from('regulations').insert([{ title: regTitle, category: finalCategory, file_url: regFileUrl }])
    }
    resetForms(); fetchData(); alert("Berhasil disimpan! ✅")
  }

  const resetForms = () => {
    setMateriTitle(''); setMateriUrl(''); setMateriDesc(''); setMateriCategory('')
    setRegTitle(''); setRegCategory(''); setRegFileUrl('')
    setEditingItem(null); setEditType(null)
  }

  const openEdit = (item: any, type: 'lesson' | 'reg') => {
    setEditingItem(item); setEditType(type)
    if (type === 'lesson') {
      setMateriTitle(item.title); setMateriUrl(item.video_url); setMateriDesc(item.description); setMateriCategory(item.category || '');
    } else {
      setRegTitle(item.title); setRegCategory(item.category); setRegFileUrl(item.file_url)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!mounted) return null
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#e3d0ba] font-black text-amber-900 italic">
        <div className="animate-pulse">MENYIAPKAN RUANG ADMIN...</div>
    </div>
  )

  const filteredUsers = users.filter(u => u.email?.toLowerCase().includes(searchUser.toLowerCase()) || u.full_name?.toLowerCase().includes(searchUser.toLowerCase()))
  const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPagesUser = Math.ceil(filteredUsers.length / itemsPerPage)

  const categoriesMateri = ['Semua', ...Array.from(new Set(lessons.map(l => l.category).filter(Boolean)))]
  const filteredLessons = lessons.filter(l => (l.title?.toLowerCase().includes(searchMateri.toLowerCase())) && (filterMateriCat === 'Semua' || l.category === filterMateriCat))
  const currentLessons = filteredLessons.slice((pageMateri - 1) * itemsPerPage, pageMateri * itemsPerPage)
  const totalPagesMateri = Math.max(1, Math.ceil(filteredLessons.length / itemsPerPage))

  const categoriesReg = ['Semua', ...Array.from(new Set(regs.map(r => r.category).filter(Boolean)))]
  const filteredRegs = regs.filter(r => (r.title?.toLowerCase().includes(searchReg.toLowerCase())) && (filterRegCat === 'Semua' || r.category === filterRegCat))
  const currentRegs = filteredRegs.slice((pageReg - 1) * itemsPerPage, pageReg * itemsPerPage)
  const totalPagesReg = Math.max(1, Math.ceil(filteredRegs.length / itemsPerPage))

  return (
    <div className="min-h-screen flex text-[#4a3728]">
      {/* STYLE KHUSUS UNTUK SCROLLBAR DROPDOWN */}
      <style jsx global>{`
        .custom-dropdown-scroll::-webkit-scrollbar { width: 6px; }
        .custom-dropdown-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-dropdown-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
        .custom-dropdown-scroll::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}</style>

      <Sidebar />
      
      <main className="flex-grow ml-20 md:ml-72 p-4 md:p-8 pb-32 transition-all duration-300 relative min-h-screen">
        <div 
          className="fixed inset-0 z-[-1]" 
          style={{ 
            backgroundImage: `url('https://www.transparenttextures.com/patterns/wood-pattern.png')`,
            backgroundColor: '#e3d0ba',
            backgroundRepeat: 'repeat'
          }}
        />
        <div className="fixed inset-0 z-[-1] bg-white/10 pointer-events-none" />

        <header className="mb-12 relative z-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase drop-shadow-md text-[#2d5a27]">Admin Command ⚡</h1>
            <p className="text-[10px] font-black text-amber-900 mt-1 uppercase tracking-widest bg-white/40 inline-block px-3 py-1 rounded-full">Management Dashboard Wood Edition v3.0</p>
          </div>
          <div className="text-right hidden md:block">
             <div className="text-xs font-black uppercase text-[#2d5a27]">Status Server</div>
             <div className="text-[10px] font-bold text-green-700 animate-pulse">● ONLINE</div>
          </div>
        </header>

        {/* 1. MANAJEMEN USER */}
        <section className="mb-20 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-black text-amber-900 italic uppercase flex items-center gap-3">
                <span className="bg-amber-900 text-white w-8 h-8 flex items-center justify-center rounded-lg text-sm not-italic">01</span>
                Persetujuan Pengguna
              </h2>
            </div>
            <div className="relative w-full md:w-72">
              <input type="text" placeholder="Cari user..." value={searchUser} onChange={(e) => { setSearchUser(e.target.value); setCurrentPage(1); }} className="w-full p-4 pl-12 bg-white/80 backdrop-blur-md border-2 border-amber-200 rounded-2xl text-xs font-bold outline-none shadow-lg focus:border-amber-900 transition-all placeholder:text-amber-300" />
              <span className="absolute left-4 top-4 text-lg">🔍</span>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-lg rounded-[3rem] shadow-2xl border-2 border-white/50 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-amber-900 text-[10px] text-amber-100 font-black uppercase tracking-widest">
                <tr><th className="p-8">User / Profile</th><th className="p-8">Status</th><th className="p-8 text-right">Aksi</th></tr>
              </thead>
              <tbody className="divide-y-2 divide-amber-100 font-bold">
                {currentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/60 transition-all group">
                    <td className="p-8">
                      <div className="text-base font-black text-[#4a3728]">{u.email}</div>
                      <div className="text-[10px] text-amber-700 uppercase tracking-tighter">{u.full_name || 'No Name'}</div>
                    </td>
                    <td className="p-8">
                      {u.is_approved ? 
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[9px] font-black border border-green-200">AKTIF ✅</span> : 
                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[9px] font-black animate-pulse border border-amber-200">MENUNGGU ⏳</span>
                      }
                    </td>
                    <td className="p-8 text-right space-x-4">
                      {!u.is_approved && <button onClick={() => handleApprove(u.id)} className="bg-amber-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg hover:scale-105 active:scale-95 transition-all">Approve</button>}
                      <button onClick={() => handleDelete('profiles', u.id)} className="text-red-600 text-[10px] font-black uppercase hover:underline">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-6 bg-amber-900/10 flex justify-center items-center gap-10 border-t-2 border-amber-100">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-6 py-2 bg-white border-2 border-amber-200 rounded-xl text-[10px] font-black disabled:opacity-30 hover:border-amber-900 transition-colors">PREV</button>
              <span className="text-xs font-black text-amber-900 uppercase">HAL {currentPage} / {totalPagesUser}</span>
              <button disabled={currentPage >= totalPagesUser} onClick={() => setCurrentPage(p => p + 1)} className="px-6 py-2 bg-white border-2 border-amber-200 rounded-xl text-[10px] font-black disabled:opacity-30 hover:border-amber-900 transition-colors">NEXT</button>
            </div>
          </div>
        </section>

        {/* 2. MANAJEMEN MATERI */}
        <section className="mb-20 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-6">
            <h2 className="text-2xl font-black text-blue-900 italic uppercase flex items-center gap-3">
              <span className="bg-blue-900 text-white w-8 h-8 flex items-center justify-center rounded-lg text-sm not-italic">02</span>
              Kelola Materi Video
            </h2>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="bg-blue-900/10 backdrop-blur-sm px-4 py-3 rounded-2xl border-2 border-blue-200 flex items-center gap-3">
                  <span className="text-[9px] font-black text-blue-900 uppercase">Import CSV:</span>
                  <input type="file" accept=".csv" onChange={(e) => handleImportCSV(e, 'materi')} className="text-[9px] font-bold cursor-pointer w-32" />
                </div>
                
                {/* UPDATE: Dropdown Materi dengan Scroll */}
                <div className="relative" ref={matDropRef}>
                    <button onClick={() => setIsMatDropOpen(!isMatDropOpen)} className="p-4 px-6 bg-white/80 border-2 border-blue-200 rounded-2xl text-[10px] font-black uppercase shadow-lg min-w-[140px] flex justify-between items-center gap-4">
                        {filterMateriCat} <span>▼</span>
                    </button>
                    {isMatDropOpen && (
                        <div className="absolute top-full mt-2 w-full bg-white border-2 border-blue-100 rounded-xl shadow-2xl z-50 overflow-hidden">
                            <div className="max-h-[250px] overflow-y-auto custom-dropdown-scroll">
                              {categoriesMateri.map(cat => (
                                  <div key={cat} onClick={() => { setFilterMateriCat(cat); setPageMateri(1); setIsMatDropOpen(false); }} className="p-3 text-[10px] font-black uppercase hover:bg-blue-50 cursor-pointer border-b border-blue-50 last:border-none">
                                      {cat}
                                  </div>
                              ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative flex-grow md:w-64">
                  <input type="text" placeholder="Cari materi..." value={searchMateri} onChange={(e) => { setSearchMateri(e.target.value); setPageMateri(1); }} className="w-full p-4 pl-12 bg-white/80 border-2 border-blue-200 rounded-2xl text-xs font-bold outline-none shadow-lg focus:border-blue-900" />
                  <span className="absolute left-4 top-4 text-lg">🔍</span>
                </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border-2 border-blue-200 mb-8">
            <form onSubmit={submitMateri} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase ml-2 text-blue-900">Judul Materi</label>
                    <input type="text" placeholder="Contoh: Pengenalan Dasar" value={materiTitle} onChange={e => setMateriTitle(e.target.value)} required className="w-full p-4 bg-white rounded-2xl text-sm font-bold outline-none border-2 border-blue-50 focus:border-blue-500 shadow-inner" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase ml-2 text-blue-900">YouTube URL</label>
                    <input type="text" placeholder="https://youtube.com/..." value={materiUrl} onChange={e => setMateriUrl(e.target.value)} required className="w-full p-4 bg-white rounded-2xl text-sm font-bold outline-none border-2 border-blue-50 focus:border-blue-500 shadow-inner" />
                </div>
                <div className="space-y-2 relative">
                    <label className="text-[10px] font-black uppercase ml-2 text-blue-900">Kategori</label>
                    <input type="text" list="materi-cats" placeholder="Pilih/Ketik..." value={materiCategory} onChange={e => setMateriCategory(e.target.value)} className="w-full p-4 bg-white rounded-2xl text-sm font-bold outline-none border-2 border-blue-50 focus:border-blue-500 shadow-inner" />
                    <datalist id="materi-cats">
                        {categoriesMateri.filter(c => c !== 'Semua').map((cat, i) => <option key={i} value={cat} />)}
                    </datalist>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase ml-2 text-blue-900">Deskripsi Singkat</label>
                <textarea placeholder="Jelaskan isi video ini..." value={materiDesc} onChange={e => setMateriDesc(e.target.value)} className="w-full p-5 bg-white rounded-3xl h-24 text-sm font-bold outline-none border-2 border-blue-50 focus:border-blue-500 shadow-inner" />
              </div>
              <button type="submit" className="w-full py-5 bg-blue-900 text-white rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-blue-950 hover:translate-y-[-2px] active:translate-y-0 transition-all">
                {editingItem ? "Update Materi Sekarang ⚡" : "Posting Materi Baru 🚀"}
              </button>
            </form>
          </div>
          
          <div className="bg-white/70 backdrop-blur-lg rounded-[3rem] shadow-xl border-2 border-blue-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-blue-900 text-[10px] font-black uppercase text-blue-100 tracking-widest">
                <tr><th className="p-6 px-8">Materi & Kategori</th><th className="p-6 px-8 text-right">Aksi</th></tr>
              </thead>
              <tbody className="divide-y-2 divide-blue-50">
                {currentLessons.map((ls) => (
                  <tr key={ls.id} className="hover:bg-blue-50/80 transition-all font-black">
                    <td className="p-6 px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 flex items-center justify-center rounded-full text-lg">🎥</div>
                        <div>
                            <div className="text-base text-blue-900 uppercase italic">{ls.title}</div>
                            <div className="text-[9px] text-blue-500 font-black uppercase mt-1 tracking-widest">📂 {ls.category || 'Umum'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 px-8 text-right space-x-6">
                      <button onClick={() => openEdit(ls, 'lesson')} className="text-blue-700 text-[10px] font-black uppercase hover:underline">Edit</button>
                      <button onClick={() => handleDelete('lessons', ls.id)} className="text-red-600 text-[10px] font-black uppercase hover:underline">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-6 bg-blue-900/5 flex justify-center items-center gap-10 border-t-2 border-blue-100">
                <button disabled={pageMateri === 1} onClick={() => setPageMateri(p => p - 1)} className="px-6 py-2 bg-white border-2 border-blue-200 rounded-xl text-[10px] font-black disabled:opacity-30">PREV</button>
                <span className="text-xs font-black text-blue-900 uppercase">HAL {pageMateri} / {totalPagesMateri}</span>
                <button disabled={pageMateri >= totalPagesMateri} onClick={() => setPageMateri(p => p + 1)} className="px-6 py-2 bg-white border-2 border-blue-200 rounded-xl text-[10px] font-black disabled:opacity-30">NEXT</button>
            </div>
          </div>
        </section>

        {/* 3. MANAJEMEN PERATURAN */}
        <section className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-6">
            <h2 className="text-2xl font-black text-[#2d5a27] italic uppercase flex items-center gap-3">
              <span className="bg-[#2d5a27] text-white w-8 h-8 flex items-center justify-center rounded-lg text-sm not-italic">03</span>
              Kelola Dokumen Peraturan
            </h2>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
              <div className="bg-green-900/10 backdrop-blur-sm px-4 py-3 rounded-2xl border-2 border-green-200 flex items-center gap-3">
                  <span className="text-[9px] font-black text-green-900 uppercase">Import CSV:</span>
                  <input type="file" accept=".csv" onChange={(e) => handleImportCSV(e, 'reg')} className="text-[9px] font-bold cursor-pointer w-32" />
              </div>

              {/* UPDATE: Dropdown Peraturan dengan Scroll */}
              <div className="relative" ref={regDropRef}>
                  <button onClick={() => setIsRegDropOpen(!isRegDropOpen)} className="p-4 px-6 bg-white/80 border-2 border-green-200 rounded-2xl text-[10px] font-black uppercase shadow-lg min-w-[140px] flex justify-between items-center gap-4">
                      {filterRegCat} <span>▼</span>
                  </button>
                  {isRegDropOpen && (
                      <div className="absolute top-full mt-2 w-full bg-white border-2 border-green-100 rounded-xl shadow-2xl z-50 overflow-hidden">
                          <div className="max-h-[250px] overflow-y-auto custom-dropdown-scroll">
                            {categoriesReg.map(cat => (
                                <div key={cat} onClick={() => { setFilterRegCat(cat); setPageReg(1); setIsRegDropOpen(false); }} className="p-3 text-[10px] font-black uppercase hover:bg-green-50 cursor-pointer border-b border-green-50 last:border-none">
                                    {cat}
                                </div>
                            ))}
                          </div>
                      </div>
                  )}
                </div>

              <div className="relative flex-grow md:w-64">
                <input type="text" placeholder="Cari nama..." value={searchReg} onChange={(e) => { setSearchReg(e.target.value); setPageReg(1); }} className="w-full p-4 pl-12 bg-white/80 border-2 border-green-200 rounded-2xl text-xs font-bold outline-none shadow-lg focus:border-green-900" />
                <span className="absolute left-4 top-4 text-lg">🔍</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border-2 border-green-200 mb-10 font-bold">
            <form onSubmit={submitReg} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase ml-2 text-[#2d5a27]">Nama Dokumen</label>
                <input type="text" placeholder="Contoh: PP No. 12 Tahun 2024" value={regTitle} onChange={e => setRegTitle(e.target.value)} required className="w-full p-4 bg-white rounded-2xl outline-none border-2 border-green-50 focus:border-green-600 shadow-inner" />
              </div>
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black uppercase ml-2 text-[#2d5a27]">Kategori</label>
                <input type="text" list="reg-cats" placeholder="Pilih/Ketik..." value={regCategory} onChange={e => setRegCategory(e.target.value)} required className="w-full p-4 bg-white rounded-2xl outline-none border-2 border-green-50 focus:border-green-600 shadow-inner" />
                <datalist id="reg-cats">
                  {categoriesReg.filter(c => c !== 'Semua').map((cat, i) => <option key={i} value={cat} />)}
                </datalist>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase ml-2 text-[#2d5a27]">Link URL PDF</label>
                <input type="text" placeholder="https://..." value={regFileUrl} onChange={e => setRegFileUrl(e.target.value)} required className="w-full p-4 bg-white rounded-2xl outline-none border-2 border-green-50 focus:border-green-600 shadow-inner" />
              </div>
              <button type="submit" className="md:col-span-3 py-5 bg-[#2d5a27] text-white rounded-2xl font-black uppercase shadow-xl hover:bg-[#1f3f1b] hover:translate-y-[-2px] transition-all">
                {editingItem ? "Update Dokumen Sekarang 📂" : "Arsipkan Peraturan Baru ✅"}
              </button>
            </form>
          </div>

          <div className="bg-white/70 backdrop-blur-lg rounded-[3rem] shadow-xl border-2 border-green-100 overflow-hidden font-bold">
            <table className="w-full text-left">
              <thead className="bg-[#2d5a27] text-[10px] font-black uppercase text-green-100 tracking-widest">
                <tr><th className="p-6 px-8">Nama Dokumen</th><th className="p-6 px-8 text-right">Aksi</th></tr>
              </thead>
              <tbody className="divide-y-2 divide-green-50">
                {currentRegs.map((rg) => (
                  <tr key={rg.id} className="hover:bg-green-50/80 transition-all font-black">
                    <td className="p-6 px-8">
                        <div className="text-base text-[#4a3728] font-black uppercase">{rg.title}</div>
                        <span className="text-[9px] bg-green-100 text-green-900 px-3 py-1 rounded-full font-black uppercase border border-green-200 inline-block mt-2">📁 {rg.category}</span>
                    </td>
                    <td className="p-6 px-8 text-right space-x-6">
                      <button onClick={() => openEdit(rg, 'reg')} className="text-green-800 text-[10px] font-black uppercase hover:underline">Edit</button>
                      <button onClick={() => handleDelete('regulations', rg.id)} className="text-red-600 text-[10px] font-black uppercase hover:underline">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-6 bg-green-900/5 flex justify-center items-center gap-10 border-t-2 border-green-100">
                <button disabled={pageReg === 1} onClick={() => setPageReg(p => p - 1)} className="px-6 py-2 bg-white border-2 border-green-200 rounded-xl text-[10px] font-black disabled:opacity-30">PREV</button>
                <span className="text-xs font-black text-green-900 uppercase">HAL {pageReg} / {totalPagesReg}</span>
                <button disabled={pageReg >= totalPagesReg} onClick={() => setPageReg(p => p + 1)} className="px-6 py-2 bg-white border-2 border-green-200 rounded-xl text-[10px] font-black disabled:opacity-30">NEXT</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}