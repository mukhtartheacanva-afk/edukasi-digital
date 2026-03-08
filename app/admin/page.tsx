 'use client'
import { useEffect, useState } from 'react'
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

  // State Edit User
  const [editUserName, setEditUserName] = useState('')
  const [isEditingUser, setIsEditingUser] = useState<string | null>(null)

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
  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-black">LOADING...</div>

  // Logic Filter & Pagination
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
    <div className="min-h-screen flex text-black">
      <Sidebar />
      
      {/* MAIN CONTAINER DENGAN MOTIF KAYU */}
      <main className="flex-grow ml-64 p-10 pb-32 relative min-h-screen">
        {/* Layer Background Kayu (Fixed agar tidak ikut scroll) */}
        <div 
          className="fixed inset-0 z-[-1]" 
          style={{ 
            backgroundImage: `url('https://www.transparenttextures.com/patterns/wood-pattern.png')`,
            backgroundColor: '#e3d0ba', // Warna kayu Oak alami
            backgroundRepeat: 'repeat'
          }}
        />
        {/* Layer Overlay Halus agar kontras */}
        <div className="fixed inset-0 z-[-1] bg-white/10 pointer-events-none" />

        <header className="mb-12 relative z-10">
          <h1 className="text-5xl font-black italic tracking-tighter uppercase drop-shadow-sm">Admin Command ⚡</h1>
          <p className="text-[10px] font-bold text-amber-900 mt-1 uppercase tracking-widest">Management Dashboard Wood Edition v3.0</p>
        </header>

        {/* 1. MANAJEMEN USER */}
        <section className="mb-16 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
            <div>
              <h2 className="text-xl font-black text-amber-900 italic uppercase">Persetujuan Pengguna</h2>
              <p className="text-[10px] text-amber-800 font-bold uppercase tracking-widest">Total: {filteredUsers.length} Pengguna</p>
            </div>
            <div className="relative w-full md:w-72">
              <input type="text" placeholder="Cari user..." value={searchUser} onChange={(e) => { setSearchUser(e.target.value); setCurrentPage(1); }} className="w-full p-3 pl-10 bg-white/80 backdrop-blur-md border border-amber-200 rounded-2xl text-xs font-bold outline-none shadow-sm focus:bg-white transition-all" />
              <span className="absolute left-4 top-3.5">🔍</span>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-lg rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden font-bold">
            <table className="w-full text-left">
              <thead className="bg-amber-900 text-[10px] text-amber-100 font-black uppercase tracking-widest">
                <tr><th className="p-6">User / Profile</th><th className="p-6">Status</th><th className="p-6 text-right">Aksi</th></tr>
              </thead>
              <tbody className="divide-y divide-amber-100 font-bold">
                {currentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/40 transition-all font-bold">
                    <td className="p-6">
                      <div className="text-sm">{u.email}</div>
                      <div className="text-[10px] text-amber-800 uppercase">{u.full_name || 'No Name'}</div>
                    </td>
                    <td className="p-6">
                      {u.is_approved ? <span className="text-green-700 text-[10px]">AKTIF ✅</span> : <span className="text-amber-700 text-[10px] animate-pulse font-black">MENUNGGU ⏳</span>}
                    </td>
                    <td className="p-6 text-right">
                      {!u.is_approved && <button onClick={() => handleApprove(u.id)} className="bg-amber-800 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase mr-2 shadow-lg">Approve</button>}
                      <button onClick={() => handleDelete('profiles', u.id)} className="text-red-600 text-[10px] font-black uppercase hover:underline">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-5 bg-amber-900/5 flex justify-center items-center gap-6 border-t border-amber-100">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 bg-white/80 border border-amber-200 rounded-xl text-[10px] font-black disabled:opacity-30">PREV</button>
              <span className="text-[10px] font-black text-amber-900 uppercase">HAL {currentPage} / {totalPagesUser}</span>
              <button disabled={currentPage >= totalPagesUser} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 bg-white/80 border border-amber-200 rounded-xl text-[10px] font-black disabled:opacity-30">NEXT</button>
            </div>
          </div>
        </section>

        {/* 2. MANAJEMEN MATERI */}
        <section className="mb-16 relative z-10">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-black text-blue-900 italic uppercase">Kelola Materi Video</h2>
            <div className="flex items-center gap-4">
               <div className="bg-blue-100/50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-blue-200 flex items-center gap-2">
                 <span className="text-[10px] font-black text-blue-800 uppercase">Import:</span>
                 <input type="file" accept=".csv" onChange={(e) => handleImportCSV(e, 'materi')} className="text-[10px] font-bold cursor-pointer w-40" />
               </div>
               
               <select value={filterMateriCat} onChange={(e) => { setFilterMateriCat(e.target.value); setPageMateri(1); }} className="p-3 bg-white/80 border border-blue-200 rounded-2xl text-[10px] font-black uppercase outline-none shadow-sm focus:bg-white">
                 {categoriesMateri.map(cat => <option key={cat} value={cat}>{cat}</option>)}
               </select>

               <div className="relative w-60">
                 <input type="text" placeholder="Cari materi..." value={searchMateri} onChange={(e) => { setSearchMateri(e.target.value); setPageMateri(1); }} className="w-full p-3 pl-10 bg-white/80 border border-blue-200 rounded-2xl text-xs font-bold outline-none shadow-sm focus:bg-white" />
                 <span className="absolute left-4 top-3.5">🔍</span>
               </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-blue-200 mb-6">
            <form onSubmit={submitMateri} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Judul Materi" value={materiTitle} onChange={e => setMateriTitle(e.target.value)} required className="p-4 bg-white/50 rounded-2xl text-sm outline-none border-2 border-transparent focus:border-blue-500 shadow-inner" />
                <input type="text" placeholder="Link YouTube Embed" value={materiUrl} onChange={e => setMateriUrl(e.target.value)} required className="p-4 bg-white/50 rounded-2xl text-sm outline-none border-2 border-transparent focus:border-blue-500 shadow-inner" />
                <div className="relative">
                  <input type="text" list="materi-cats" placeholder="Kategori" value={materiCategory} onChange={e => setMateriCategory(e.target.value)} className="w-full p-4 bg-white/50 rounded-2xl text-sm outline-none border-2 border-transparent focus:border-blue-500 shadow-inner" />
                  <datalist id="materi-cats">
                    {categoriesMateri.filter(c => c !== 'Semua').map((cat, i) => <option key={i} value={cat} />)}
                  </datalist>
                </div>
              </div>
              <textarea placeholder="Deskripsi..." value={materiDesc} onChange={e => setMateriDesc(e.target.value)} className="w-full p-4 bg-white/50 rounded-2xl h-20 text-sm outline-none border-2 border-transparent focus:border-blue-500 shadow-inner" />
              <button type="submit" className="w-full py-4 bg-blue-900 text-white rounded-2xl font-black uppercase text-xs shadow-xl hover:scale-[1.01] transition-transform">{editingItem ? "Update Materi" : "Simpan Materi 🚀"}</button>
            </form>
          </div>
          
          <div className="bg-white/70 backdrop-blur-lg rounded-[2.5rem] shadow-xl border border-blue-100 overflow-hidden font-bold">
            <table className="w-full text-left">
              <thead className="bg-blue-900 text-[10px] font-black uppercase text-blue-100 tracking-widest">
                <tr><th className="p-4">Judul Materi</th><th className="p-4 text-right">Aksi</th></tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {currentLessons.map((ls) => (
                  <tr key={ls.id} className="hover:bg-blue-50/50">
                    <td className="p-4 text-sm font-black">
                      <div className="flex flex-col">
                        <span>{ls.title}</span>
                        <span className="text-[10px] text-blue-700 font-bold uppercase">📁 {ls.category || 'Umum'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-3">
                      <button onClick={() => openEdit(ls, 'lesson')} className="text-blue-700 text-xs font-black">Edit</button>
                      <button onClick={() => handleDelete('lessons', ls.id)} className="text-red-600 text-xs font-black">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 bg-blue-900/5 flex justify-center items-center gap-4 border-t border-blue-100">
               <button disabled={pageMateri === 1} onClick={() => setPageMateri(p => p - 1)} className="px-4 py-2 bg-white border border-blue-200 rounded-xl text-[10px] font-black disabled:opacity-30">PREV</button>
               <span className="text-[10px] font-black text-blue-900">HAL {pageMateri} / {totalPagesMateri}</span>
               <button disabled={pageMateri >= totalPagesMateri} onClick={() => setPageMateri(p => p + 1)} className="px-4 py-2 bg-white border border-blue-200 rounded-xl text-[10px] font-black disabled:opacity-30">NEXT</button>
            </div>
          </div>
        </section>

        {/* 3. MANAJEMEN PERATURAN */}
        <section className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
            <div>
              <h2 className="text-xl font-black text-green-900 italic uppercase">Kelola Dokumen Peraturan</h2>
              <p className="text-[10px] text-green-800 font-bold uppercase tracking-widest">Total: {filteredRegs.length} Dokumen</p>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto items-center">
              <div className="bg-green-100/50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-green-200 flex items-center gap-2">
                 <span className="text-[10px] font-black text-green-800 uppercase">Import:</span>
                 <input type="file" accept=".csv" onChange={(e) => handleImportCSV(e, 'reg')} className="text-[10px] font-bold cursor-pointer w-40" />
              </div>

              <select value={filterRegCat} onChange={(e) => { setFilterRegCat(e.target.value); setPageReg(1); }} className="p-3 bg-white/80 border border-green-200 rounded-2xl text-[10px] font-black uppercase outline-none shadow-sm focus:bg-white">
                {categoriesReg.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>

              <div className="relative w-60">
                <input type="text" placeholder="Cari nama..." value={searchReg} onChange={(e) => { setSearchReg(e.target.value); setPageReg(1); }} className="w-full p-3 pl-10 bg-white/80 border border-green-200 rounded-2xl text-xs font-bold outline-none shadow-sm focus:bg-white" />
                <span className="absolute left-4 top-3.5">🔍</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-green-200 mb-8 font-bold">
            <form onSubmit={submitReg} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="Nama Dokumen" value={regTitle} onChange={e => setRegTitle(e.target.value)} required className="p-4 bg-white/50 rounded-2xl outline-none border-2 border-transparent focus:border-green-600 shadow-inner" />
              <div className="relative">
                <input type="text" list="reg-cats" placeholder="Kategori" value={regCategory} onChange={e => setRegCategory(e.target.value)} required className="w-full p-4 bg-white/50 rounded-2xl outline-none border-2 border-transparent focus:border-green-600 shadow-inner" />
                <datalist id="reg-cats">
                  {categoriesReg.filter(c => c !== 'Semua').map((cat, i) => <option key={i} value={cat} />)}
                </datalist>
              </div>
              <input type="text" placeholder="Link PDF" value={regFileUrl} onChange={e => setRegFileUrl(e.target.value)} required className="p-4 bg-white/50 rounded-2xl outline-none border-2 border-transparent focus:border-green-600 shadow-inner" />
              <button type="submit" className="md:col-span-3 py-4 bg-green-900 text-white rounded-2xl font-black uppercase shadow-xl hover:scale-[1.01] transition-transform">{editingItem ? "Update Peraturan" : "Tambah Peraturan ✅"}</button>
            </form>
          </div>

          <div className="bg-white/70 backdrop-blur-lg rounded-[2.5rem] shadow-xl border border-green-100 overflow-hidden font-bold">
            <table className="w-full text-left">
              <thead className="bg-green-900 text-[10px] font-black uppercase text-green-100 tracking-widest">
                <tr><th className="p-4">Nama Dokumen</th><th className="p-4 text-right">Aksi</th></tr>
              </thead>
              <tbody className="divide-y divide-green-50">
                {currentRegs.map((rg) => (
                  <tr key={rg.id} className="hover:bg-green-50/50 transition-all font-black">
                    <td className="p-4 text-sm font-black">{rg.title} <span className="text-[10px] bg-green-100 text-green-900 px-2 py-0.5 rounded ml-2 font-black uppercase border border-green-200">{rg.category}</span></td>
                    <td className="p-4 text-right space-x-3">
                      <button onClick={() => openEdit(rg, 'reg')} className="text-green-800 text-xs font-black">Edit</button>
                      <button onClick={() => handleDelete('regulations', rg.id)} className="text-red-600 text-xs font-black">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 bg-green-900/5 flex justify-center items-center gap-4 border-t border-green-100">
               <button disabled={pageReg === 1} onClick={() => setPageReg(p => p - 1)} className="px-4 py-2 bg-white border border-green-200 rounded-xl text-[10px] font-black disabled:opacity-30">PREV</button>
               <span className="text-[10px] font-black text-green-900 uppercase">HAL {pageReg} / {totalPagesReg}</span>
               <button disabled={pageReg >= totalPagesReg} onClick={() => setPageReg(p => p + 1)} className="px-4 py-2 bg-white border border-green-200 rounded-xl text-[10px] font-black disabled:opacity-30">NEXT</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}