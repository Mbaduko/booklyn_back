import { v2 as cloudinary } from 'cloudinary';
import Config from '@/config';

cloudinary.config({
  cloud_name: Config.env.cloudinaryCloudName,
  api_key: Config.env.cloudinaryApiKey,
  api_secret: Config.env.cloudinaryApiSecret,
});

export default cloudinary;
