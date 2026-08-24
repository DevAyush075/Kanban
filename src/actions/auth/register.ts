'use server';

import { registerSchema, type RegisterInput } from '@/lib/validations/auth';
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

export async function registerUser(input: RegisterInput | FormData | unknown): Promise<ActionResult> {
  const dataToValidate = input instanceof FormData ? Object.fromEntries(input.entries()) : input;
  const result = registerSchema.safeParse(dataToValidate);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { name, email: rawEmail, password } = result.data;
  const email = rawEmail.trim().toLowerCase();

  try {
    let existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      existingUser = await prisma.user.findFirst({
        where: {
          email: {
            equals: email,
            mode: 'insensitive',
          },
        },
      });
    }

    if (existingUser) {
      return {
        success: false,
        errors: {
          email: ['An account with this email already exists.'],
        },
      };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email,
        passwordHash,
      },
    });

    return {
      success: true,
      message: 'Account created successfully! Redirecting...',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred during registration. Please try again.',
    };
  }
}
