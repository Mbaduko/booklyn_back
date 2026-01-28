import AppError from '@/utils/AppError';
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function zodValidate(schema: ZodSchema, getObject: (req: Request) => any) {
  return (req: Request, res: Response, next: NextFunction) => {
    const obj = getObject(req);
    const result = schema.safeParse(obj);
    if (!result.success) {
      const errors = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`);
      return next(new AppError(errors[0], 400));
    }
    return next();
  };
}
