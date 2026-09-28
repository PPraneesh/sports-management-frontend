interface StatusBadgeProps {
  status: string;
}

const getStatusClasses = (status: string) => {
  switch (status) {
    case 'OPEN':
      return 'bg-green-100 text-green-700';

    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-700';

    case 'REGISTRATION_CLOSED':
      return 'bg-yellow-100 text-yellow-700';

    case 'FIXTURES_GENERATED':
      return 'bg-purple-100 text-purple-700';

    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-700';

    case 'CANCELLED':
      return 'bg-red-100 text-red-700';

    case 'DRAFT':
      return 'bg-gray-100 text-gray-700';

    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
        status
      )}`}
    >
      {status.replaceAll('_', ' ')}
    </span>
  );
}