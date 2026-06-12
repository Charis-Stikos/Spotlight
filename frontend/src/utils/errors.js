// Μετατρέπει σφάλμα axios σε φιλικό μήνυμα + πεδία (envelope: { error: { message, details } })
export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  const data = err?.response?.data;
  if (data?.error?.message) return data.error.message;
  if (typeof data?.message === 'string') return data.message;
  // Αποτυχία ή timeout σύνδεσης — συνήθως λάθος δίκτυο/firewall, όχι σφάλμα της εφαρμογής
  if (err?.message === 'Network Error' || err?.code === 'ECONNABORTED') {
    return 'Cannot reach the server. Make sure the backend is running and you are on the same Wi-Fi.';
  }
  return fallback;
}

export function getFieldErrors(err) {
  return err?.response?.data?.error?.details || null;
}
