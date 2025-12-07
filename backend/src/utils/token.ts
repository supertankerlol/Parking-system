import jwt from 'jsonwebtoken';
import { config } from '../config';

/**
 * Generate a JWT token
 * @param payload - The payload to encode in the token
 * @param expiresIn - Optional expiration time (e.g., '1h', '7d', '30d'). Defaults to '7d'
 * @returns string - The generated JWT token
 */
export function generateToken(payload: object, expiresIn?: string): string {
  const defaultExpiresIn = '7d';
  const finalExpiresIn = expiresIn ?? defaultExpiresIn;
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: finalExpiresIn,
  } as jwt.SignOptions);
}

/**
 * Verify a JWT token
 * @param token - The JWT token to verify
 * @returns object - The decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
