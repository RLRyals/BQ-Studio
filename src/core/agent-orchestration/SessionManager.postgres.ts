/**
 * Session Manager (PostgreSQL)
 * Manages Claude Pro/Max subscription session tokens using PostgreSQL
 *
 * This replaces the electron-store-based SessionManager for plugin mode.
 */

import { ClaudeSession } from './types';
import type { PluginDatabase } from '../database/PluginDatabase';

export class SessionManager {
  private currentSession: ClaudeSession | null = null;
  private userId: string;

  constructor(
    private database: PluginDatabase,
    userId: string = 'default-user'
  ) {
    this.userId = userId;
  }

  /**
   * Initialize - Load session from database
   */
  async initialize(): Promise<void> {
    await this.loadSessionFromDatabase();
  }

  /**
   * Load session from PostgreSQL
   */
  private async loadSessionFromDatabase(): Promise<void> {
    try {
      const sessionRecord = await this.database.getSession(this.userId);

      if (sessionRecord) {
        this.currentSession = {
          sessionToken: sessionRecord.session_token,
          userId: sessionRecord.user_id,
          subscriptionTier: sessionRecord.subscription_tier,
          expiresAt: sessionRecord.expires_at || undefined,
          isValid: this.validateSessionRecord(sessionRecord),
        };
      }
    } catch (error) {
      console.error('Failed to load session from database:', error);
      this.currentSession = null;
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
    try {
      // Save to database
      const sessionRecord = await this.database.saveSession(
        userId,
        sessionToken,
        subscriptionTier,
        expiresAt
      );

      // Update in-memory session
      this.currentSession = {
        sessionToken: sessionRecord.session_token,
        userId: sessionRecord.user_id,
        subscriptionTier: sessionRecord.subscription_tier,
        expiresAt: sessionRecord.expires_at || undefined,
        isValid: true,
      };

      this.userId = userId;
    } catch (error) {
      console.error('Failed to save session to database:', error);
      throw new Error(`Failed to save session: ${(error as Error).message}`);
    }
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
  async clearSession(): Promise<void> {
    try {
      await this.database.deleteSession(this.userId);
      this.currentSession = null;
    } catch (error) {
      console.error('Failed to delete session from database:', error);
      throw new Error(`Failed to clear session: ${(error as Error).message}`);
    }
  }

  /**
   * Validate session record from database
   */
  private validateSessionRecord(session: {
    session_token: string;
    user_id: string;
    expires_at: Date | null;
  }): boolean {
    // Check if expired
    if (session.expires_at) {
      const now = new Date();
      if (now > session.expires_at) {
        return false;
      }
    }

    // Basic validation
    if (!session.session_token || !session.user_id) {
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
  async updateExpiry(expiresAt: Date): Promise<void> {
    if (!this.currentSession) {
      return;
    }

    try {
      await this.database.updateSessionExpiry(this.userId, expiresAt);

      // Update in-memory session
      this.currentSession.expiresAt = expiresAt;
    } catch (error) {
      console.error('Failed to update session expiry:', error);
      throw new Error(`Failed to update expiry: ${(error as Error).message}`);
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

  /**
   * Reload session from database
   * Useful for checking if session was updated externally
   */
  async reload(): Promise<void> {
    await this.loadSessionFromDatabase();
  }

  /**
   * Get user ID
   */
  getUserId(): string {
    return this.userId;
  }
}
