export function formatPrice(n: number): string {
  return '৳' + n.toLocaleString('en-BD');
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Dhaka',
  });
}
