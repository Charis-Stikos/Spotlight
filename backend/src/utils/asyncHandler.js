// Προωθεί τα σφάλματα των async handlers στον error handler του Express
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
