import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useCallback, useState } from 'react';
import {jwtDecode} from 'jwt-decode';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export interface GoogleSignInConfig {
  androidClientId: string;
  iosClientId: string;
  webClientId: string;
  apiUrl: string;
}

export interface GoogleUser {
  id: string;
  email: string;
  username?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface SignInResult {
  success: boolean;
  user?: GoogleUser;
  token?: string;
  error?: string;
}

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

/**
 * Hook for Google Sign-in with Expo AuthSession
 * Sends idToken to backend (not accessToken)
 *
 * This matches the backend's loginWithGoogle function which expects:
 * POST /auth/google { idToken }
 */
export const useGoogleSignIn = (config: GoogleSignInConfig) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectUrl = Platform.OS === 'web' 
  ? 'https://localhost:3000/api/auth/google/callback'  // Your actual web domain
  : AuthSession.getRedirectUrl()

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: config.webClientId,
      androidClientId: config.androidClientId,
      iosClientId: config.iosClientId,
      scopes: ['profile', 'email', 'openid'], // Request ID token
      redirectUrl: redirectUrl,
      usePKCE: true,
      responseType: 'id_token',
      projectNameForProxy: '@olatundeawo/improvtrend',
    },
    discovery
  );

  const signIn = useCallback(
    async (): Promise<SignInResult> => {
      setIsLoading(true);
      setError(null);

      try {
        if (!request) {
          throw new Error('Auth request not ready');
        }

        const result = await promptAsync();

        if (result?.type !== 'success') {
          setError('Google sign-in was cancelled');
          return { success: false, error: 'Cancelled' };
        }

        // Extract the ID token from the response
        let idToken: string | null = null;

        // Method 1: Check if response has params with id_token
        if (result.params?.id_token) {
          idToken = result.params.id_token;
        }
        // Method 2: Check if it's in the response directly
        else if ((result as any).id_token) {
          idToken = (result as any).id_token;
        }
        // Method 3: Try to extract from authentication object
        else if (result.authentication) {
          // If we have an access token, we'd need to exchange it server-side
          // For now, extract from response params
          const responseParams = new URLSearchParams(result.url?.split('?')[1]);
          idToken = responseParams.get('id_token');
        }

        if (!idToken) {
          throw new Error(
            'Failed to get ID token from Google. Check OAuth configuration.'
          );
        }

        // Send ID token to your backend
        const backendResult = await authenticateWithBackend(
          idToken,
          config.apiUrl
        );

        if (!backendResult.success) {
          throw new Error(backendResult.error || 'Backend authentication failed');
        }

        setIsLoading(false);
        return {
          success: true,
          user: backendResult.user,
          token: backendResult.token,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Google Sign-in error:', errorMessage);
        setError(errorMessage);
        setIsLoading(false);
        return { success: false, error: errorMessage };
      }
    },
    [request, promptAsync, config.apiUrl]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    signIn,
    isLoading,
    error,
    clearError,
    isReady: !!request,
  };
};

/**
 * Authenticate with your backend using Google ID token
 * Matches your backend's loginWithGoogle function signature
 */
const authenticateWithBackend = async (
  idToken: string,
  apiUrl: string
): Promise<{
  success: boolean;
  user?: GoogleUser;
  token?: string;
  error?: string;
}> => {
  try {
    console.log('Sending idToken to backend...');

    const response = await fetch(`${apiUrl}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || 
        errorData.error || 
        `Server error: ${response.status}`
      );
    }

    const data = await response.json();

    if (!data.token || !data.user) {
      throw new Error('Invalid response from backend');
    }

    return {
      success: true,
      user: data.user,
      token: data.token,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';
    console.error('Backend authentication error:', message);
    return {
      success: false,
      error: message,
    };
  }
};

/**
 * Decode ID token locally (for debugging or getting claims without backend call)
 * NOTE: Always verify on the backend! This is just for inspection.
 */
export const decodeIdToken = (idToken: string) => {
  try {
    const decoded = jwtDecode<any>(idToken);
    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      emailVerified: decoded.email_verified,
      iat: decoded.iat,
      exp: decoded.exp,
    };
  } catch (error) {
    console.error('Error decoding ID token:', error);
    return null;
  }
};

/**
 * Check if ID token is expired
 */
export const isIdTokenExpired = (idToken: string): boolean => {
  try {
    const decoded = jwtDecode<any>(idToken);
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch {
    return true;
  }
};