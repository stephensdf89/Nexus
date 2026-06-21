export default function Topbar() {
  return (
    <div className="w-full h-16 bg-[#0f0f0f] border-b border-[#222] flex items-center justify-between px-6">
      <input
        type="text"
        placeholder="Search..."
        className="bg-[#1a1a1a] border border-[#333] rounded-md px-4 py-2 text-sm text-white w-1/3"
      />

      <div className="flex items-center gap-4">
        <button className="text-gray-300 hover:text-white">🔔</button>
        <button className="text-gray-300 hover:text-white">⚙️</button>
        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
          S
        </div>
      </div>
    </div>
  );
}
