/**
 * Usage Tracker (PostgreSQL)
 * Tracks token usage across executions using PostgreSQL
 *
 * This replaces the in-memory UsageTracker for plugin mode.
 */

import { TokenUsageReport } from './types';
import type { PluginDatabase } from '../database/PluginDatabase';

export interface UsageSummary {
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  executionCount: number;
  byJob: Map<string, TokenUsageReport>;
  bySeries: Map<number, { totalTokens: number; executionCount: number }>;
}

export interface DailyUsage {
  date: string; // YYYY-MM-DD
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  executionCount: number;
}

export class UsageTracker {
  constructor(private database: PluginDatabase) {}

  /**
   * Record token usage for a job
   */
  async record(
    jobId: string,
    inputTokens: number,
    outputTokens: number,
    seriesId?: number
  ): Promise<void> {
    try {
      await this.database.recordTokenUsage(
        jobId,
        seriesId || null,
        inputTokens,
        outputTokens
      );
    } catch (error) {
      console.error('Failed to record token usage:', error);
      throw new Error(`Failed to record usage: ${(error as Error).message}`);
    }
  }

  /**
   * Get usage for a specific job
   */
  async getJobUsage(jobId: string): Promise<TokenUsageReport | undefined> {
    try {
      const records = await this.database.getTokenUsageByJob(jobId);

      if (records.length === 0) {
        return undefined;
      }

      // Return the most recent usage for this job
      const latest = records[0];

      return {
        jobId: latest.job_id || jobId,
        inputTokens: latest.input_tokens,
        outputTokens: latest.output_tokens,
        totalTokens: latest.total_tokens,
        timestamp: latest.timestamp,
      };
    } catch (error) {
      console.error('Failed to get job usage:', error);
      return undefined;
    }
  }

  /**
   * Get total usage summary
   */
  async getTotalUsage(): Promise<UsageSummary> {
    try {
      const summary = await this.database.getTotalTokenUsage();

      // For now, return empty maps for byJob and bySeries
      // These could be populated with additional queries if needed
      return {
        totalTokens: summary.total_tokens,
        inputTokens: summary.input_tokens,
        outputTokens: summary.output_tokens,
        executionCount: summary.execution_count,
        byJob: new Map(),
        bySeries: new Map(),
      };
    } catch (error) {
      console.error('Failed to get total usage:', error);
      return {
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        executionCount: 0,
        byJob: new Map(),
        bySeries: new Map(),
      };
    }
  }

  /**
   * Get usage for a specific date
   */
  async getDailyUsage(date: Date): Promise<DailyUsage | undefined> {
    try {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      endDate.setHours(0, 0, 0, 0);

      const results = await this.database.getDailyTokenUsage(startDate, endDate);

      if (results.length === 0) {
        return undefined;
      }

      const result = results[0];

      return {
        date: result.date,
        totalTokens: result.total_tokens,
        inputTokens: result.input_tokens,
        outputTokens: result.output_tokens,
        executionCount: result.execution_count,
      };
    } catch (error) {
      console.error('Failed to get daily usage:', error);
      return undefined;
    }
  }

  /**
   * Get usage for date range
   */
  async getUsageRange(startDate: Date, endDate: Date): Promise<DailyUsage[]> {
    try {
      const results = await this.database.getDailyTokenUsage(startDate, endDate);

      return results.map((r) => ({
        date: r.date,
        totalTokens: r.total_tokens,
        inputTokens: r.input_tokens,
        outputTokens: r.output_tokens,
        executionCount: r.execution_count,
      }));
    } catch (error) {
      console.error('Failed to get usage range:', error);
      return [];
    }
  }

  /**
   * Get usage for last N days
   */
  async getRecentUsage(days: number = 7): Promise<DailyUsage[]> {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 1); // Include today
    endDate.setHours(0, 0, 0, 0);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    return await this.getUsageRange(startDate, endDate);
  }

  /**
   * Get current month usage
   */
  async getCurrentMonthUsage(): Promise<DailyUsage[]> {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endDate.setDate(endDate.getDate() + 1); // Include last day
    endDate.setHours(0, 0, 0, 0);

    return await this.getUsageRange(startDate, endDate);
  }

  /**
   * Calculate total tokens for a period
   */
  getTotalTokensForPeriod(dailyUsage: DailyUsage[]): number {
    return dailyUsage.reduce((sum, day) => sum + day.totalTokens, 0);
  }

  /**
   * Check if approaching subscription limit
   * Claude Pro: ~500K tokens per month (estimated)
   * Claude Max: Higher limit (TBD)
   */
  async isApproachingLimit(
    subscriptionTier: 'pro' | 'max',
    warningThreshold: number = 0.8
  ): Promise<boolean> {
    const monthlyUsage = await this.getCurrentMonthUsage();
    const totalTokens = this.getTotalTokensForPeriod(monthlyUsage);

    // Estimated limits (to be verified)
    const limits = {
      pro: 500000, // 500K tokens/month (estimated)
      max: 2000000, // 2M tokens/month (estimated)
    };

    const limit = limits[subscriptionTier];
    return totalTokens >= limit * warningThreshold;
  }

  /**
   * Get usage percentage for current month
   */
  async getUsagePercentage(subscriptionTier: 'pro' | 'max'): Promise<number> {
    const monthlyUsage = await this.getCurrentMonthUsage();
    const totalTokens = this.getTotalTokensForPeriod(monthlyUsage);

    const limits = {
      pro: 500000,
      max: 2000000,
    };

    const limit = limits[subscriptionTier];
    return (totalTokens / limit) * 100;
  }

  /**
   * Clear old records (older than retention days)
   */
  async cleanup(retentionDays: number = 90): Promise<number> {
    try {
      const deletedCount = await this.database.cleanupOldTokenUsage(retentionDays);
      return deletedCount;
    } catch (error) {
      console.error('Failed to cleanup old token usage:', error);
      return 0;
    }
  }

  /**
   * Export usage data as JSON
   */
  async exportToJSON(): Promise<string> {
    try {
      const summary = await this.getTotalUsage();
      const recentUsage = await this.getRecentUsage(30);

      return JSON.stringify(
        {
          summary,
          recentUsage,
          exportedAt: new Date().toISOString(),
        },
        null,
        2
      );
    } catch (error) {
      console.error('Failed to export usage data:', error);
      return JSON.stringify({ error: 'Failed to export data' }, null, 2);
    }
  }

  /**
   * Get monthly usage summary (optimized query)
   */
  async getMonthlyUsageSummary(): Promise<{
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
  }> {
    try {
      const result = await this.database.getMonthlyTokenUsage();
      return {
        totalTokens: result.total_tokens,
        inputTokens: result.input_tokens,
        outputTokens: result.output_tokens,
      };
    } catch (error) {
      console.error('Failed to get monthly usage summary:', error);
      return {
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
      };
    }
  }

  /**
   * Get usage for a specific series
   */
  async getSeriesUsage(seriesId: number): Promise<{
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
    executionCount: number;
  }> {
    try {
      const records = await this.database.getTokenUsageBySeries(seriesId);

      return {
        totalTokens: records.reduce((sum, r) => sum + r.total_tokens, 0),
        inputTokens: records.reduce((sum, r) => sum + r.input_tokens, 0),
        outputTokens: records.reduce((sum, r) => sum + r.output_tokens, 0),
        executionCount: records.length,
      };
    } catch (error) {
      console.error('Failed to get series usage:', error);
      return {
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        executionCount: 0,
      };
    }
  }
}
