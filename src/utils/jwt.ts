import jwt from 'jsonwebtoken';
import Config from '../config';
import { JwtPayload } from '@/types/library';

export function generateJwtToken(payload: JwtPayload): string {
  const secret = Config.env.jwtSecret;

  return jwt.sign(payload, secret, {
    expiresIn: Config.env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}
