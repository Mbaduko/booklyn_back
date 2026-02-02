import dotenv from 'dotenv';

dotenv.config();

interface ConfigVariables {
  dbUri: string;
  resendApiKey: string;
  resendSenderEmail: string;
  redisUrl: string;
  bookReservationPeriodHours: number;
  pickRemindTime: number;
}

export default class Config{

    private static _env: ConfigVariables;

    static validateEnv = ():void => {
        const requiredEnvVars = ['DATABASE_URL', 'REDIS_URL', 'RESEND_API_KEY', 'RESEND_SENDER_EMAIL'];
        let missingVars = false;
        
        requiredEnvVars.forEach((varName) => {
            if (!process.env[varName]) {
                console.error(`Warning: Environment variable ${varName} is not set.`);
                missingVars = true;
            }
        });
        
        if (missingVars)
            process.exit(1);

        console.log("All required environment variables are set.");
    };

    static get env(): ConfigVariables {
        Config.validateEnv();
        Config._env = {
            dbUri: process.env.DATABASE_URL as string,
            resendApiKey: process.env.RESEND_API_KEY as string,
            resendSenderEmail: process.env.RESEND_SENDER_EMAIL as string,
            redisUrl: process.env.REDIS_URL as string,

            bookReservationPeriodHours: (() => {
                const v = Number(process.env.BOOK_RESERVATION_PERIOD_HOURS)
                return Number.isFinite(v) ? v : 24
            })(),

            pickRemindTime: (() => {
                const v = Number(process.env.PICK_REMIND_TIME)
                return Number.isFinite(v) ? v : 2
            })(),
        }

        return Config._env;
    }
}