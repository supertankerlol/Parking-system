import bcrypt from 'bcrypt';

/**
 * Hash a plain password using bcrypt
 * @param plain - The plain text password to hash
 * @returns Promise<string> - The hashed password
 */
export async function hashPassword(plain: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(plain, saltRounds);
}

/**
 * Compare a plain password with a hash
 * @param plain - The plain text password to compare
 * @param hash - The hashed password to compare against
 * @returns Promise<boolean> - True if passwords match, false otherwise
 */
export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(plain, hash);
}
