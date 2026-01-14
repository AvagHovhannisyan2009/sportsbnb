/**
 * Generic auth error mapper to prevent information leakage.
 * This prevents attackers from enumerating valid accounts or
 * learning about system internals through error messages.
 */
export const getGenericAuthError = (error: unknown, context: 'login' | 'signup'): string => {
  // Log detailed error for debugging (server-side in production)
  console.error('Auth error:', error);
  
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
  
  if (context === 'login') {
    // Never confirm whether email exists
    return 'Invalid email or password';
  }
  
  if (context === 'signup') {
    // Generic message unless rate limit
    if (errorMessage.includes('rate limit')) {
      return 'Too many attempts. Please try again later.';
    }
    return 'Unable to create account. Please try again or contact support.';
  }
  
  return 'An unexpected error occurred. Please try again.';
};
