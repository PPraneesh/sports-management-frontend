interface PublicStatCardProps {
  label: string;
  value: string | number;
}

export default function PublicStatCard({
  label,
  value,
}: PublicStatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}