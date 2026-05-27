import { ApiError } from '../utils/ApiError.js';

// Επικύρωση body/query/params με Zod· αντικαθιστά την είσοδο με τα καθαρισμένα δεδομένα
export const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    return next(ApiError.badRequest('Validation failed', result.error.flatten().fieldErrors));
  }
  req[source] = result.data;
  next();
};
