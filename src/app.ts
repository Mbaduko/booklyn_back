import express, { NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';


import { Application, Request, Response } from 'express';
import Config from './config';
import errorHandler from './middlewares/errorHandler';
import AppError from './utils/AppError';

Config.validateEnv();

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

app.get('/', (req: Request, res: Response): Response => {
    return res.send('Welcome to Booklyn API!');
});

// Handle 404 errors
app.use((req: Request, res: Response): Response => {
    return res.status(404).send({ error: 'Not Found' });
});


// Error handling middleware (should be last)
app.use(errorHandler);


export default app;