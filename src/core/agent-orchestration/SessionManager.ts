/**
 * Session Manager
 * Manages Claude Pro/Max subscription session tokens
 */

import Store from 'electron-store';
import { ClaudeSession } from './types';

interface StoredSession {
  sessionToken: string;
  userId: string;
  subscriptionTier: 'pro' | 'max';
  expiresAt?: string; // ISO date string
}

interface SessionStore {
  currentSession?: StoredSession;
}

export class SessionManager {
  private store: Store<SessionStore>;
  private currentSession: ClaudeSession | null = null;

  constructor() {
    // Initialize electron-store with encryption
    this.store = new Store<SessionStore>({
      name: 'claude-session-config',
      encryptionKey: 'bq-studio-claude-session-encryption-key', // In production, use a more secure key
    });

    // Load session from store
    this.loadSessionFromStore();
  }

  /**
   * Load session from encrypted store
   */
  private loadSessionFromStore(): void {
    const storedSession = this.store.get('currentSession');

    if (storedSession) {
      this.currentSession = {
        sessionToken: storedSession.sessionToken,
        userId: storedSession.userId,
        subscriptionTier: storedSession.subscriptionTier,
        expiresAt: storedSession.expiresAt ? new Date(storedSession.expiresAt) : undefined,
        isValid: this.validateSession(storedSession),
      };
    }
  }

  /**
   * Save session (authenticate user)
   */
  async saveSession(
    sessionToken: string,
    userId: string,
    subscriptionTier: 'pro' | 'max',
    expiresAt?: Date
  ): Promise<void> {
    const session: StoredSession = {
      sessionToken,
      userId,
      subscriptionTier,
      expiresAt: expiresAt?.toISOString(),
    };

    // Store encrypted
    this.store.set('currentSession', session);

    // Update current session
    this.currentSession = {
      sessionToken,
      userId,
      subscriptionTier,
      expiresAt,
      isValid: true,
    };
  }

  /**
   * Get current session
   */
  getSession(): ClaudeSession | null {
    if (!this.currentSession) {
      return null;
    }

    // Re-validate before returning
    if (!this.isSessionValid()) {
      this.currentSession.isValid = false;
    }

    return this.currentSession;
  }

  /**
   * Check if session is valid
   */
  isSessionValid(): boolean {
    if (!this.currentSession) {
      return false;
    }

    // Check if expired
    if (this.currentSession.expiresAt) {
      const now = new Date();
      if (now > this.currentSession.expiresAt) {
        return false;
      }
    }

    return this.currentSession.isValid;
  }

  /**
   * Clear session (logout)
   */
  clearSession(): void {
    this.store.delete('currentSession');
    this.currentSession = null;
  }

  /**
   * Validate stored session
   */
  private validateSession(session: StoredSession): boolean {
    // Check if expired
    if (session.expiresAt) {
      const expiresAt = new Date(session.expiresAt);
      const now = new Date();
      if (now > expiresAt) {
        return false;
      }
    }

    // Basic validation
    if (!session.sessionToken || !session.userId) {
      return false;
    }

    return true;
  }

  /**
   * Get session token for Claude Code CLI
   */
  getSessionToken(): string | null {
    if (!this.isSessionValid()) {
      return null;
    }

    return this.currentSession?.sessionToken ?? null;
  }

  /**
   * Get subscription tier
   */
  getSubscriptionTier(): 'pro' | 'max' | null {
    if (!this.isSessionValid()) {
      return null;
    }

    return this.currentSession?.subscriptionTier ?? null;
  }

  /**
   * Update session expiry
   */
  updateExpiry(expiresAt: Date): void {
    if (!this.currentSession) {
      return;
    }

    this.currentSession.expiresAt = expiresAt;

    const storedSession = this.store.get('currentSession');
    if (storedSession) {
      storedSession.expiresAt = expiresAt.toISOString();
      this.store.set('currentSession', storedSession);
    }
  }

  /**
   * Mark session as invalid
   */
  invalidateSession(): void {
    if (this.currentSession) {
      this.currentSession.isValid = false;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isSessionValid();
  }
}
