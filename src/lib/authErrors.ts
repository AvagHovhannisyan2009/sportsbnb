import { AuthError } from '@supabase/supabase-js';

/**
 * Auth error mapper that provides helpful messages while maintaining security.
 * This prevents attackers from enumerating valid accounts or
 * learning about system internals through error messages.
 */
export const getGenericAuthError = (error: unknown, context: 'login' | 'signup'): string => {
  // Log detailed error for debugging
  console.error('Auth error:', error);
  
  const authError = error as AuthError;
  const errorMessage = authError?.message?.toLowerCase() || '';
  const errorCode = authError?.code?.toLowerCase() || '';
  
  if (context === 'login') {
    // Never confirm whether email exists
    return 'Invalid email or password';
  }
  
  if (context === 'signup') {
    // Rate limit errors
    if (errorMessage.includes('rate limit') || errorCode.includes('rate_limit')) {
      return 'Too many attempts. Please try again later.';
    }
    
    // User already exists
    if (errorMessage.includes('already registered') || 
        errorMessage.includes('user_already_exists') || 
        errorMessage.includes('already exists') ||
        errorCode.includes('user_already_exists')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    
    // Email not allowed
    if (errorMessage.includes('email not allowed') || errorCode.includes('email_not_allowed')) {
      return 'This email domain is not allowed. Please use a different email.';
    }
    
    // Weak password
    if (errorMessage.includes('password') && (errorMessage.includes('weak') || errorMessage.includes('short'))) {
      return 'Password is too weak. Please use a stronger password.';
    }
    
    // Invalid email
    if (errorMessage.includes('invalid') && errorMessage.includes('email')) {
      return 'Please enter a valid email address.';
    }
    
    // Signup disabled
    if (errorMessage.includes('signups not allowed') || errorCode.includes('signup_disabled')) {
      return 'Account registration is currently disabled. Please contact support.';
    }
    
    // Database/trigger errors
    if (errorMessage.includes('database') || errorMessage.includes('trigger') || errorMessage.includes('constraint')) {
      return 'There was an issue creating your account. Please try again.';
    }
    
    // Network errors
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    // Generic fallback with the actual error for debugging
    return `Unable to create account: ${authError?.message || 'Unknown error'}`;
  }
  
  return 'An unexpected error occurred. Please try again.';
};
