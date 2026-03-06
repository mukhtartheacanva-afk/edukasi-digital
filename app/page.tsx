 export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold text-blue-600">
        Selamat Datang di Aplikasi Edukasi Digital
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Platform belajar mandiri dengan materi terstruktur.
      </p>
      <p className="mt-2 text-sm text-red-500">
        "Silakan login untuk mengakses materi video dan dokumen."
      </p>
      
      <button className="mt-8 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition">
        Masuk Ke Dashboard
      </button>
    </main>
  );
}