export const formatCurrency = (amount, currency = 'INR') => {
  if (amount == null || Number.isNaN(Number(amount))) return '—';
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(Number(amount));
  } catch {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  }
};

export const formatDate = (value, opts) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', opts || { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDateRange = (dates = []) => {
  const upcoming = [...dates]
    .map((d) => new Date(d))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a - b);
  if (!upcoming.length) return 'Dates to be announced';
  return upcoming.map((d) => formatDate(d)).join('  ·  ');
};

export const nextDeparture = (dates = []) => {
  const now = new Date();
  const future = [...dates]
    .map((d) => new Date(d))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a - b);
  return future.find((d) => d >= now) || future[future.length - 1] || null;
};

// "Starting from" headline price for a yatra card/hero — the cheaper of its
// two seat-type prices. Never a separate frontend constant: always derived
// from whatever the admin has saved for this yatra.
export const startingPrice = (price = {}) => {
  const candidates = [price.normalSeat, price.sleeperSeat].map(Number).filter((n) => Number.isFinite(n) && n > 0);
  return candidates.length ? Math.min(...candidates) : undefined;
};

export const durationLabel = (days, nights) => {
  if (!days && !nights) return '';
  const parts = [];
  if (days) parts.push(`${days} Day${days > 1 ? 's' : ''}`);
  if (nights) parts.push(`${nights} Night${nights > 1 ? 's' : ''}`);
  return parts.join(' / ');
};
