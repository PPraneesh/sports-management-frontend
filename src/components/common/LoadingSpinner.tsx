interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({
  message = 'Loading...',
}: LoadingSpinnerProps) {
  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

        <p className="text-sm text-gray-500">
          {message}
        </p>
      </div>
    </div>
  );
}