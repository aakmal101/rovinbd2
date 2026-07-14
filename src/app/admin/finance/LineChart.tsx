'use client';
import { useState, useRef } from 'react';
import { formatPrice, formatDate } from '@/lib/format';

type Point = { date: number; value: number };

const STROKE = '#c2410c'; // brand-700 — passes contrast solo (see dataviz validator)
const FILL = '#f97316'; // brand-500, low-alpha area fill only

export default function LineChart({ points, label }: { points: Point[]; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 720, H = 200, PAD = 28;
  if (points.length === 0) {
    return <div className="h-[200px] flex items-center justify-center text-sm text-stone-400">No data in this range</div>;
  }

  const values = points.map((p) => p.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const x = (i: number) => PAD + (i / Math.max(points.length - 1, 1)) * (W - PAD * 2);
  const y = (v: number) => H - PAD - ((v - min) / range) * (H - PAD * 2);

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.value)}`).join(' ');
  const areaPath = `${linePath} L ${x(points.length - 1)} ${H - PAD} L ${x(0)} ${H - PAD} Z`;

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((relX - PAD) / (W - PAD * 2)) * (points.length - 1));
    setHover(Math.max(0, Math.min(points.length - 1, i)));
  };

  const hp = hover != null ? points[hover] : points[points.length - 1];

  return (
    <div className="relative">
      <div className="flex items-baseline justify-between mb-1">
        <div className="text-sm text-stone-500">{label}</div>
        <div className="text-right">
          <div className="text-lg font-bold text-stone-900">{formatPrice(hp.value)}</div>
          <div className="text-xs text-stone-400">{formatDate(hp.date).split(',').slice(0, 2).join(',')}</div>
        </div>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-[200px] touch-none"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="finance-line-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={FILL} stopOpacity="0.18" />
            <stop offset="100%" stopColor={FILL} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* recessive baseline */}
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#e7e5e4" strokeWidth="1" />
        <path d={areaPath} fill="url(#finance-line-fill)" stroke="none" />
        <path d={linePath} fill="none" stroke={STROKE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* rounded data-end anchored to baseline */}
        <circle cx={x(points.length - 1)} cy={y(points[points.length - 1].value)} r="4" fill={STROKE} />
        {hover != null && (
          <>
            <line x1={x(hover)} y1={PAD} x2={x(hover)} y2={H - PAD} stroke="#a8a29e" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(points[hover].value)} r="5" fill="#fff" stroke={STROKE} strokeWidth="2" />
          </>
        )}
        <text x={PAD} y={H - 8} fontSize="10" fill="#a8a29e">{formatDate(points[0].date).split(',')[0]}</text>
        <text x={W - PAD} y={H - 8} fontSize="10" fill="#a8a29e" textAnchor="end">{formatDate(points[points.length - 1].date).split(',')[0]}</text>
      </svg>
    </div>
  );
}
