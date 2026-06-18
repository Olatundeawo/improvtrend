const API_URL = process.env.EXPO_PUBLIC_BASE_URL;

let serverAwake = false;
let wakingPromise: Promise<void> | null = null;

/**
 * Wakes up the backend if it's sleeping (cold start).
 * Prevents duplicate wake calls.
 */
async function wakeServer() {
  if (serverAwake) return;

  if (!wakingPromise) {
    wakingPromise = new Promise(async (resolve, reject) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 150000);

      try {
        const res = await fetch(`${API_URL}/health`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Health check failed");
        }

        serverAwake = true;
        resolve();
      } catch (err) {
        serverAwake = false;
        wakingPromise = null;
        reject(err);
      } finally {
        clearTimeout(timeout);
      }
    });
  }

  return wakingPromise;
}

/**
 * Centralized API fetch
 */
export async function apiFetch(
  endpoint: string,
  options?: RequestInit
) {
  try {
    await wakeServer();
  } catch {
    // Let UI show loader / retry
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  // If server slept again, allow re-wake next time
  if (!res.ok && res.status >= 500) {
    serverAwake = false;
  }

  return res;
}
