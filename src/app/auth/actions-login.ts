'use server'

import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'

export async function authenticate(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  try {
    const payload = Object.fromEntries(formData);
    
    // signIn will authenticate and set the session cookie
    await signIn('credentials', payload);
    
    return { success: true };
  } catch (error) {
    // Check if this is a redirect error (which means auth succeeded)
    if ((error as any)?.digest?.includes('NEXT_REDIRECT')) {
      redirect('/dashboard');
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials.' };
        default:
          return { error: 'Something went wrong.' };
      }
    }
    return { error: 'An unexpected error occurred.' };
  }
}
