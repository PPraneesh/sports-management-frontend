interface ErrorAlertProps {
  message: string;
  onClose?: () => void;
}

export default function ErrorAlert({
  message,
  onClose,
}: ErrorAlertProps) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <p>{message}</p>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="font-semibold text-red-700 hover:text-red-900"
        >
          ×
        </button>
      )}
    </div>
  );
}