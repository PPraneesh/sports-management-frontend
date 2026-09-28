import { Link } from 'react-router';

interface PlaceholderPageProps {
  title?: string;
  description?: string;
}

export default function PlaceholderPage({
  title = 'Under Construction',
  description = 'This page is currently being prepared and will be available soon.',
}: PlaceholderPageProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <svg
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.05 1.543.367 2.628 1.737 2.628 3.328 0 .61-.157 1.18-.432 1.674m-3.939-5.185l-1.92-1.92"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-gray-500">{description}</p>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50"
        >
          Go Back
        </button>
        <Link
          to="/dashboard"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-gray-800"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
