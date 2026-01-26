import dotenv from 'dotenv';

dotenv.config();

interface ConfigVariables {
  port: number;
  dbUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
}

export default class Config{

    private static _env: ConfigVariables;

    static validateEnv = ():void => {
        const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_EXPIRES_IN'];
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
            port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
            dbUri: process.env.DB_URI as string,
            jwtSecret: process.env.JWT_SECRET as string,
            jwtExpiresIn: process.env.JWT_EXPIRES_IN as string,
        };
        return Config._env;
    }
}