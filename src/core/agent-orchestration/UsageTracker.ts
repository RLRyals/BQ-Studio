/**
 * Usage Tracker
 * Tracks token usage across executions for monitoring subscription limits
 */

import { TokenUsageReport } from './types';

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
  private usageRecords: TokenUsageReport[] = [];
  private dailyUsage: Map<string, DailyUsage> = new Map();

  /**
   * Record token usage for a job
   */
  record(jobId: string, inputTokens: number, outputTokens: number, seriesId?: number): void {
    const report: TokenUsageReport = {
      jobId,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      timestamp: new Date(),
    };

    this.usageRecords.push(report);

    // Update daily usage
    const dateKey = this.getDateKey(report.timestamp);
    const daily = this.dailyUsage.get(dateKey) || {
      date: dateKey,
      totalTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      executionCount: 0,
    };

    daily.totalTokens += report.totalTokens;
    daily.inputTokens += report.inputTokens;
    daily.outputTokens += report.outputTokens;
    daily.executionCount++;

    this.dailyUsage.set(dateKey, daily);
  }

  /**
   * Get usage for a specific job
   */
  getJobUsage(jobId: string): TokenUsageReport | undefined {
    // Return the most recent usage for this job
    const records = this.usageRecords.filter((r) => r.jobId === jobId);
    return records[records.length - 1];
  }

  /**
   * Get total usage summary
   */
  getTotalUsage(): UsageSummary {
    const byJob = new Map<string, TokenUsageReport>();
    const bySeries = new Map<number, { totalTokens: number; executionCount: number }>();

    let totalTokens = 0;
    let inputTokens = 0;
    let outputTokens = 0;

    for (const record of this.usageRecords) {
      totalTokens += record.totalTokens;
      inputTokens += record.inputTokens;
      outputTokens += record.outputTokens;

      // Store by job (most recent)
      byJob.set(record.jobId, record);
    }

    return {
      totalTokens,
      inputTokens,
      outputTokens,
      executionCount: byJob.size,
      byJob,
      bySeries,
    };
  }

  /**
   * Get usage for a specific date
   */
  getDailyUsage(date: Date): DailyUsage | undefined {
    const dateKey = this.getDateKey(date);
    return this.dailyUsage.get(dateKey);
  }

  /**
   * Get usage for date range
   */
  getUsageRange(startDate: Date, endDate: Date): DailyUsage[] {
    const results: DailyUsage[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dateKey = this.getDateKey(current);
      const usage = this.dailyUsage.get(dateKey);

      if (usage) {
        results.push(usage);
      }

      current.setDate(current.getDate() + 1);
    }

    return results;
  }

  /**
   * Get usage for last N days
   */
  getRecentUsage(days: number = 7): DailyUsage[] {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);

    return this.getUsageRange(startDate, endDate);
  }

  /**
   * Get current month usage
   */
  getCurrentMonthUsage(): DailyUsage[] {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return this.getUsageRange(startDate, endDate);
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
  isApproachingLimit(subscriptionTier: 'pro' | 'max', warningThreshold: number = 0.8): boolean {
    const monthlyUsage = this.getCurrentMonthUsage();
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
  getUsagePercentage(subscriptionTier: 'pro' | 'max'): number {
    const monthlyUsage = this.getCurrentMonthUsage();
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
  cleanup(retentionDays: number = 90): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Remove old usage records
    this.usageRecords = this.usageRecords.filter(
      (record) => record.timestamp > cutoffDate
    );

    // Remove old daily usage
    const cutoffDateKey = this.getDateKey(cutoffDate);
    for (const [dateKey, _] of this.dailyUsage.entries()) {
      if (dateKey < cutoffDateKey) {
        this.dailyUsage.delete(dateKey);
      }
    }
  }

  /**
   * Export usage data as JSON
   */
  exportToJSON(): string {
    return JSON.stringify(
      {
        records: this.usageRecords,
        dailyUsage: Array.from(this.dailyUsage.entries()),
        summary: this.getTotalUsage(),
      },
      null,
      2
    );
  }

  /**
   * Helper: Get date key (YYYY-MM-DD)
   */
  private getDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
