import type { ReactNode } from 'react';

interface PublicStatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: ReactNode;
  isLive?: boolean;
  variant?: 'default' | 'live' | 'champion' | 'info';
}

export default function PublicStatCard({
  label,
  value,
  sublabel,
  icon,
  isLive = false,
  variant = 'default',
}: PublicStatCardProps) {
  if (variant === 'live' || isLive) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-red-200/80 bg-gradient-to-br from-red-500/10 via-white to-red-500/5 p-4 sm:p-5 shadow-xs transition hover:shadow-md hover:border-red-300">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-red-600">
            {label}
          </p>
          <span className="flex items-center gap-1.5 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-extrabold text-red-700">
            <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
            LIVE
          </span>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <p className="text-3xl font-black text-gray-900 tracking-tight">
            {value}
          </p>
          {icon && <div className="text-red-500/80">{icon}</div>}
        </div>
        {sublabel && (
          <p className="mt-1 text-[11px] font-medium text-red-500/90">{sublabel}</p>
        )}
      </div>
    );
  }

  if (variant === 'champion') {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-amber-300/80 bg-gradient-to-br from-amber-500/15 via-amber-50 to-yellow-100/50 p-4 sm:p-5 shadow-xs transition hover:shadow-md hover:border-amber-400">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
            {label}
          </p>
          <span className="text-amber-600 font-bold text-xs">👑</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xl sm:text-2xl font-black text-amber-950 truncate tracking-tight">
            {value}
          </p>
          {icon && <div className="text-amber-600">{icon}</div>}
        </div>
        {sublabel && (
          <p className="mt-1 text-[11px] font-semibold text-amber-700">{sublabel}</p>
        )}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-4 sm:p-5 shadow-2xs transition hover:shadow-sm hover:border-gray-300">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <p className="mt-2 text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
        {value}
      </p>
      {sublabel && (
        <p className="mt-1 text-[11px] text-gray-400 font-medium">{sublabel}</p>
      )}
    </div>
  );
}