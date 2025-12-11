"use strict";
/**
 * Session Manager (PostgreSQL)
 * Manages Claude Pro/Max subscription session tokens using PostgreSQL
 *
 * This replaces the electron-store-based SessionManager for plugin mode.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManager = void 0;
class SessionManager {
    constructor(database, userId = 'default-user') {
        this.database = database;
        this.currentSession = null;
        this.userId = userId;
    }
    /**
     * Initialize - Load session from database
     */
    async initialize() {
        await this.loadSessionFromDatabase();
    }
    /**
     * Load session from PostgreSQL
     */
    async loadSessionFromDatabase() {
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
        }
        catch (error) {
            console.error('Failed to load session from database:', error);
            this.currentSession = null;
        }
    }
    /**
     * Save session (authenticate user)
     */
    async saveSession(sessionToken, userId, subscriptionTier, expiresAt) {
        try {
            // Save to database
            const sessionRecord = await this.database.saveSession(userId, sessionToken, subscriptionTier, expiresAt);
            // Update in-memory session
            this.currentSession = {
                sessionToken: sessionRecord.session_token,
                userId: sessionRecord.user_id,
                subscriptionTier: sessionRecord.subscription_tier,
                expiresAt: sessionRecord.expires_at || undefined,
                isValid: true,
            };
            this.userId = userId;
        }
        catch (error) {
            console.error('Failed to save session to database:', error);
            throw new Error(`Failed to save session: ${error.message}`);
        }
    }
    /**
     * Get current session
     */
    getSession() {
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
    isSessionValid() {
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
    async clearSession() {
        try {
            await this.database.deleteSession(this.userId);
            this.currentSession = null;
        }
        catch (error) {
            console.error('Failed to delete session from database:', error);
            throw new Error(`Failed to clear session: ${error.message}`);
        }
    }
    /**
     * Validate session record from database
     */
    validateSessionRecord(session) {
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
    getSessionToken() {
        if (!this.isSessionValid()) {
            return null;
        }
        return this.currentSession?.sessionToken ?? null;
    }
    /**
     * Get subscription tier
     */
    getSubscriptionTier() {
        if (!this.isSessionValid()) {
            return null;
        }
        return this.currentSession?.subscriptionTier ?? null;
    }
    /**
     * Update session expiry
     */
    async updateExpiry(expiresAt) {
        if (!this.currentSession) {
            return;
        }
        try {
            await this.database.updateSessionExpiry(this.userId, expiresAt);
            // Update in-memory session
            this.currentSession.expiresAt = expiresAt;
        }
        catch (error) {
            console.error('Failed to update session expiry:', error);
            throw new Error(`Failed to update expiry: ${error.message}`);
        }
    }
    /**
     * Mark session as invalid
     */
    invalidateSession() {
        if (this.currentSession) {
            this.currentSession.isValid = false;
        }
    }
    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.isSessionValid();
    }
    /**
     * Reload session from database
     * Useful for checking if session was updated externally
     */
    async reload() {
        await this.loadSessionFromDatabase();
    }
    /**
     * Get user ID
     */
    getUserId() {
        return this.userId;
    }
}
exports.SessionManager = SessionManager;
