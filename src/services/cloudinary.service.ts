import cloudinary from '@/lib/cloudinary';
import AppError from '@/utils/AppError';

export class CloudinaryService {
  static async uploadImage(
    buffer: Buffer,
    folder?: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder || 'booklyn',
          resource_type: 'image',
          format: 'webp',
        },
        (error, result) => {
          if (error) {
            return reject(new AppError('Failed to upload image', 500));
          }
          if (!result?.secure_url) {
            console.warn('No secure URL returned from Cloudinary');
            return reject(new AppError('Failed to upload image',500));
          }
          resolve(result.secure_url);
        }
      );

      uploadStream.end(buffer);
    });
  }

  static async deleteImage(imageUrl: string): Promise<void> {
      // Extract public ID from Cloudinary URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const publicId = fileName.split('.')[0]; // Remove file extension
      
      // Delete the image from Cloudinary
      await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
      });
  }
}
