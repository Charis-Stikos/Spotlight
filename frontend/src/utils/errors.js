// Μετατρέπει σφάλμα axios σε φιλικό μήνυμα + πεδία (envelope: { error: { message, details } })
export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  const data = err?.response?.data;
  if (data?.error?.message) return data.error.message;
  if (typeof data?.message === 'string') return data.message;
  if (err?.message === 'Network Error') return 'Cannot reach the server. Check the API URL and your connection.';
  return fallback;
}

export function getFieldErrors(err) {
  return err?.response?.data?.error?.details || null;
}
