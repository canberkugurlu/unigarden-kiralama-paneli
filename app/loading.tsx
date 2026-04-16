export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Başlık */}
      <div className="h-8 w-48 bg-gray-200 rounded-lg" />

      {/* Kart satırı */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-200 rounded-xl" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
            <div className="h-7 w-16 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* İçerik alanı */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <div className="h-5 w-40 bg-gray-200 rounded" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="space-y-1">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
