"use client";

import {
  getSession as refreshSession,
  signIn as authJsSignIn,
  signOut as authJsSignOut,
  useSession as useAuthJsSession,
} from "next-auth/react";

type ClientError = { message: string };
type CallbackOptions<T> = {
  onRequest?: () => void;
  onSuccess?: (context: { data: T }) => void;
  onError?: (context: { error: ClientError }) => void;
};

async function post<T>(url: string, body: unknown): Promise<{ data: T | null; error: ClientError | null }> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    if (!response.ok) {
      return { data: null, error: { message: payload.error ?? "Request failed" } };
    }
    return { data: payload as T, error: null };
  } catch (error) {
    return {
      data: null,
      error: { message: error instanceof Error ? error.message : "Request failed" },
    };
  }
}

export async function signInWithTicket(loginTicket: string) {
  return authJsSignIn("credentials", { loginTicket, redirect: false });
}

export function useSession() {
  const session = useAuthJsSession();
  return { ...session, isPending: session.status === "loading" };
}

export async function signOut(options?: {
  fetchOptions?: { onSuccess?: () => void; onError?: (context: { error: ClientError }) => void };
}) {
  try {
    const result = await authJsSignOut({ redirect: false });
    options?.fetchOptions?.onSuccess?.();
    return result;
  } catch (error) {
    options?.fetchOptions?.onError?.({
      error: { message: error instanceof Error ? error.message : "Sign out failed" },
    });
  }
}

export const signIn = { withTicket: signInWithTicket };

export const signUp = {
  async email(
    input: { name: string; email: string; password: string; role: string; stationId: string },
    callbacks?: CallbackOptions<{ user: unknown }>,
  ) {
    callbacks?.onRequest?.();
    const result = await post<{ user: unknown; loginTicket: string }>("/api/auth/sign-up", input);

    if (result.error || !result.data) {
      callbacks?.onError?.({ error: result.error ?? { message: "Registration failed" } });
      return result;
    }

    const authResult = await signInWithTicket(result.data.loginTicket);
    if (authResult?.error) {
      const error = { message: "Registration succeeded, but sign in failed" };
      callbacks?.onError?.({ error });
      return { data: null, error };
    }

    callbacks?.onSuccess?.({ data: result.data });
    return result;
  },
};

async function verifyAndCreateSession(action: string, body: Record<string, unknown>) {
  const result = await post<{ loginTicket?: string }>("/api/auth/two-factor", {
    action,
    ...body,
  });
  if (result.data?.loginTicket) {
    const authResult = await signInWithTicket(result.data.loginTicket);
    if (authResult?.error) return { data: null, error: { message: "Sign in failed" } };
  } else if (!result.error) {
    await refreshSession({ broadcast: true });
  }
  return result;
}

export const twoFactor = {
  enable: (input: { password: string }) =>
    post<{ totpURI: string; backupCodes: string[] }>("/api/auth/two-factor", {
      action: "enable",
      ...input,
    }),
  async disable(input: { password: string }) {
    const result = await post<{ status: boolean }>("/api/auth/two-factor", {
      action: "disable",
      ...input,
    });
    if (!result.error) await refreshSession({ broadcast: true });
    return result;
  },
  verifyTotp: (input: { code: string }) =>
    verifyAndCreateSession("verify-totp", input),
  verifyBackupCode: (input: { code: string }) =>
    verifyAndCreateSession("verify-backup-code", input),
};
