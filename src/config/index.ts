import dotenv from 'dotenv';

dotenv.config();

interface ConfigVariables {
  port: number;
  dbUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
  maxBooksPerUser: number;
  bookReservationPeriodHours: number;
  holdBookDurationDays: number;
}

export default class Config{

    private static _env: ConfigVariables;

    static validateEnv = ():void => {
        const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_EXPIRES_IN', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
        const optionalEnvVars = ['MAX_BOOKS_PER_USER', 'BOOK_RESERVATION_PERIOD_HOURS', 'HOLD_BOOK_DURATION_DAYS'];
        let missingVars = false;
        
        requiredEnvVars.forEach((varName) => {
            if (!process.env[varName]) {
                console.error(`Warning: Environment variable ${varName} is not set.`);
                missingVars = true;
            }
        });

        optionalEnvVars.forEach((varName) => {
            if (!process.env[varName]) {
                console.log(`Info: Optional environment variable ${varName} is not set. Using default value.`);
            }
        });
        
        if (missingVars)
            process.exit(1);

        console.log("All required environment variables are set.");
    };

    static get env(): ConfigVariables {
        Config.validateEnv();
        Config._env = {
            port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
            dbUri: process.env.DATABASE_URL as string,
            jwtSecret: process.env.JWT_SECRET as string,
            jwtExpiresIn: process.env.JWT_EXPIRES_IN as string,
            cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
            cloudinaryApiKey: process.env.CLOUDINARY_API_KEY as string,
            cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET as string,
            maxBooksPerUser: process.env.MAX_BOOKS_PER_USER ? parseInt(process.env.MAX_BOOKS_PER_USER, 10) : 5,
            bookReservationPeriodHours: process.env.BOOK_RESERVATION_PERIOD_HOURS ? parseInt(process.env.BOOK_RESERVATION_PERIOD_HOURS, 10) : 24,
            holdBookDurationDays: process.env.HOLD_BOOK_DURATION_DAYS ? parseInt(process.env.HOLD_BOOK_DURATION_DAYS, 10) : 14,
        };
        return Config._env;
    }
}