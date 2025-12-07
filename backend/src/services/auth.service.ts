import { prisma } from '../repositories/prisma.client';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateToken } from '../utils/token';

// Types
interface SignupInput {
  fullName: string;
  email: string;
  phone?: string;
  licensePlate?: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface UserWithoutPassword {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  defaultLicense: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

interface LoginResponse {
  user: UserWithoutPassword;
  token: string;
}

/**
 * Sign up a new user
 * @param input - User signup data
 * @returns Promise<UserWithoutPassword> - The created user without password
 * @throws Error if email already exists
 */
export async function signup(input: SignupInput): Promise<UserWithoutPassword> {
  const { fullName, email, phone, licensePlate, password } = input;

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('Email already exists');
  }

  // Hash the password
  const passwordHash = await hashPassword(password);

  // Create the user
  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      phone: phone || null,
      defaultLicense: licensePlate || null,
      passwordHash,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      avatarUrl: true,
      defaultLicense: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

/**
 * Login a user
 * @param input - User login credentials
 * @returns Promise<LoginResponse> - User data and JWT token
 * @throws Error if user not found or password is invalid
 */
export async function login(input: LoginInput): Promise<LoginResponse> {
  const { email, password } = input;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate JWT token
  const token = generateToken({ userId: user.id, email: user.email });

  // Return user without password and token
  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
}
