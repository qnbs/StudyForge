export function MendeleySync() {
  return (
    <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-y-auto md:overflow-hidden pb-16 md:pb-0">
      <div className="w-full md:w-1/3 bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8 flex flex-col items-center justify-center text-center shrink-0 h-fit">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 md:mb-6 border border-red-100">
          <span className="text-xl md:text-2xl font-bold text-red-700 font-serif">M</span>
        </div>
        <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-2">Connect to Mendeley</h2>
        <p className="text-slate-500 max-w-md mb-4 md:mb-6 text-xs md:text-sm">
          Authenticate with your Mendeley account to import your library. 
        </p>
        <div className="space-y-3 w-full">
          <button className="w-full bg-[#9E002B] text-white font-medium py-2.5 md:py-2 rounded-lg hover:bg-red-800 transition-colors flex justify-center items-center gap-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2">
              Authenticate via OAuth
          </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl border-dashed flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
            <span className="text-2xl font-bold text-slate-400 font-serif">M</span>
          </div>
          <h3 className="text-md font-medium text-slate-900 mb-2">Awaiting Authentication</h3>
          <p className="text-sm text-slate-500 leading-relaxed max-w-xs">Please click the button to authenticate and sync your Mendeley library to local storage.</p>
      </div>
    </div>
  );
}
