interface LoadingSkeletonProps {
  count?: number;
  type?: 'card' | 'line' | 'table';
  className?: string;
}

export default function LoadingSkeleton({
  count = 3,
  type = 'card',
  className = '',
}: LoadingSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === 'line') {
    return (
      <div className={`space-y-3 ${className}`}>
        {items.map((i) => (
          <div
            key={i}
            className="h-4 animate-pulse rounded bg-gray-200"
            style={{ width: `${85 - (i % 3) * 15}%` }}
          />
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`overflow-hidden rounded-xl border border-gray-200 bg-white ${className}`}>
        <div className="h-10 animate-pulse border-b border-gray-200 bg-gray-100" />
        <div className="divide-y divide-gray-100 p-4 space-y-4">
          {items.map((i) => (
            <div key={i} className="flex items-center gap-4 pt-3 first:pt-0">
              <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
              <div className="h-4 flex-1 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {items.map((i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-200 bg-white p-5 space-y-4 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-3/5 rounded bg-gray-200" />
            <div className="h-5 w-16 rounded-full bg-gray-200" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-4/5 rounded bg-gray-200" />
            <div className="h-3 w-1/2 rounded bg-gray-200" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="h-3 w-24 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
