export const formatDateTime = (
  value: string | null | undefined
) => {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};


export const formatDate = (
  value: string | null | undefined
) => {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleDateString('en-IN', {
    dateStyle: 'medium',
  });
};


export const toLocalDateTimeString = (
  value: string
) => {
  if (!value) {
    return value;
  }

  return value.length === 16
    ? `${value}:00`
    : value;
};


export const toDateTimeLocalInput = (
  value: string | null | undefined
) => {
  if (!value) {
    return '';
  }

  return value.slice(0, 16);
};