import { Request, Response, NextFunction } from 'express';
import { CloudinaryService } from '@/services/cloudinary.service';
import AppError from '@/utils/AppError';

interface AuthenticatedRequest extends Request {
  file?: Express.Multer.File;
}

export const uploadToCloudinary = (fieldName: string, folder?: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        return next();
      }

      const imageUrl = await CloudinaryService.uploadImage(req.file.buffer, folder);
      
      // Replace the file field with the Cloudinary URL
      req.body[fieldName] = imageUrl;
      
      // Remove the file buffer reference
      delete req.file;
      
      next();
    } catch (error) {
      next(error);
    }
  };
};
