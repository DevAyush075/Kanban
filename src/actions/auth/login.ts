'use server';

import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export interface ActionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
}

export async function loginUser(input: LoginInput | FormData | unknown): Promise<ActionResult> {
  const dataToValidate = input instanceof FormData ? Object.fromEntries(input.entries()) : input;
  const result = loginSchema.safeParse(dataToValidate);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email: rawEmail, password } = result.data;
  const email = rawEmail.trim().toLowerCase();

  try {
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.findFirst({
        where: {
          email: {
            equals: email,
            mode: 'insensitive',
          },
        },
      });
    }

    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password. Please check your credentials.',
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid email or password. Please check your credentials.',
      };
    }

    return {
      success: true,
      message: 'Welcome back! Signing you in...',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'An unexpected database error occurred during login. Please try again.',
    };
  }
}
