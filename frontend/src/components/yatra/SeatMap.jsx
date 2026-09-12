export default function SeatMap({ layout = [], states = {}, selected = [], onChange }) {
  const selectedSet = new Set(selected);
  const rows = [...new Set(layout.map((seat) => seat.row))].sort((a, b) => a - b);

  const toggle = (seatId, state) => {
    if (state === 'booked' || state === 'locked') return;
    onChange(selectedSet.has(seatId) ? selected.filter((id) => id !== seatId) : [...selected, seatId]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-amber-100/60">
        {[['available', 'Available'], ['selected', 'Selected'], ['locked', 'Unavailable'], ['booked', 'Booked']].map(([key, label]) => (
          <span key={key} className="inline-flex items-center gap-1.5"><i className={`w-3 h-3 rounded-sm border ${key === 'available' ? 'border-amber-200/30' : key === 'selected' ? 'bg-amber-300 border-amber-200' : key === 'booked' ? 'bg-white/15 border-white/10' : 'bg-red-400/20 border-red-300/30'}`} />{label}</span>
        ))}
      </div>
      <div className="rounded-xl border border-amber-200/12 bg-black/10 p-3 sm:p-4 space-y-2 overflow-x-auto">
        <div className="text-center text-[10px] uppercase tracking-[0.2em] text-amber-100/35 mb-3">Front</div>
        {rows.map((row) => (
          <div key={row} className="flex justify-center gap-2 min-w-[250px]">
            {layout.filter((seat) => seat.row === row).sort((a, b) => a.column - b.column).map((seat) => {
              const state = selectedSet.has(seat.seatId) ? 'selected' : (states[seat.seatId] || 'available');
              return <button key={seat.seatId} type="button" disabled={state === 'booked' || state === 'locked'} onClick={() => toggle(seat.seatId, state)} aria-label={`${seat.label} ${state}`} className={`h-10 w-12 sm:w-14 rounded-lg border text-xs font-semibold transition ${state === 'selected' ? 'bg-amber-300 text-black border-amber-100' : state === 'available' ? 'text-amber-50 border-amber-200/25 hover:border-amber-200 hover:bg-amber-300/10' : state === 'booked' ? 'bg-white/10 text-white/30 border-white/10 cursor-not-allowed' : 'bg-red-400/10 text-red-200/40 border-red-300/20 cursor-not-allowed'}`}>{seat.label}</button>;
            })}
          </div>
        ))}
      </div>
      <p className="text-xs text-amber-100/45">{selected.length ? `${selected.length} seat${selected.length === 1 ? '' : 's'} selected: ${selected.join(', ')}` : 'Choose one or more available seats.'}</p>
    </div>
  );
}