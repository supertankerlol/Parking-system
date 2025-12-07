// Type definitions for Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        fullName: string;
        email: string;
        phone: string | null;
        avatarUrl: string | null;
        defaultLicense: string | null;
        role: string;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
}

// Export empty object to make this a module
export {};
