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
  holdBookDuration: number;
  resendApiKey: string;
  resendSenderEmail: string;
  redisUrl: string;
  pickRemindTime: number;
  dueRemindTime: number;
}

export default class Config{

    private static _env: ConfigVariables;

    static validateEnv = ():void => {
        const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_EXPIRES_IN', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'REDIS_URL'];
        const optionalEnvVars = ['MAX_BOOKS_PER_USER', 'BOOK_RESERVATION_PERIOD_HOURS', 'HOLD_BOOK_DURATION_DAYS', 'RESEND_API_KEY', 'RESEND_SENDER_EMAIL', 'PICK_REMIND_TIME', 'DUE_REMIND_TIME'];
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
            port: (() => {
                const v = Number(process.env.PORT)
                return Number.isFinite(v) ? v : 3000
            })(),

            dbUri: process.env.DATABASE_URL as string,
            jwtSecret: process.env.JWT_SECRET as string,
            jwtExpiresIn: process.env.JWT_EXPIRES_IN as string,
            cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
            cloudinaryApiKey: process.env.CLOUDINARY_API_KEY as string,
            cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET as string,

            maxBooksPerUser: (() => {
                const v = Number(process.env.MAX_BOOKS_PER_USER)
                return Number.isFinite(v) ? v : 5
            })(),

            bookReservationPeriodHours: (() => {
                const v = Number(process.env.BOOK_RESERVATION_PERIOD_HOURS)
                return Number.isFinite(v) ? v : 24
            })(),

            holdBookDuration: (() => {
                const v = Number(process.env.HOLD_BOOK_DURATION_DAYS)
                return Number.isFinite(v) ? v : 14
            })(),

            resendApiKey: process.env.RESEND_API_KEY as string,
            resendSenderEmail: process.env.RESEND_SENDER_EMAIL as string,
            redisUrl: process.env.REDIS_URL as string,

            pickRemindTime: (() => {
                const v = Number(process.env.PICK_REMIND_TIME)
                return Number.isFinite(v) ? v : 2
            })(),

            dueRemindTime: (() => {
                const v = Number(process.env.DUE_REMIND_TIME)
                return Number.isFinite(v) ? v : 24
            })(),
        }

        return Config._env;
    }
}