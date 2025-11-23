import { useState, useEffect, useCallback } from 'react';
import { mcpClient } from '../services/mcpClient';

export interface MCPQueryOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

/**
 * Generic MCP data fetching hook
 */
export function useMCPData<T>(
  queryFn: () => Promise<T>,
  options: MCPQueryOptions = {}
) {
  const { enabled = true, refetchInterval } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      setData(result);
    } catch (err) {
      setError(err as Error);
      console.error('MCP query failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [queryFn, enabled]);

  useEffect(() => {
    refetch();

    // Set up refetch interval if specified
    if (refetchInterval && refetchInterval > 0) {
      const intervalId = setInterval(refetch, refetchInterval);
      return () => clearInterval(intervalId);
    }
  }, [refetch, refetchInterval]);

  return { data, isLoading, error, refetch };
}

/**
 * Hook to fetch plot threads for tension graph
 */
export function usePlotThreads(bookId: string | null, options?: MCPQueryOptions) {
  return useMCPData(
    () => mcpClient.getPlotThreads(bookId!),
    { ...options, enabled: options?.enabled !== false && !!bookId }
  );
}

/**
 * Hook to fetch tension/pressure data
 */
export function useTensionData(
  bookId: string | null,
  threadId?: string,
  options?: MCPQueryOptions
) {
  return useMCPData(
    () => mcpClient.getTensionData(bookId!, threadId),
    { ...options, enabled: options?.enabled !== false && !!bookId }
  );
}

/**
 * Hook to fetch NPE compliance data
 */
export function useNPECompliance(
  context: { bookId?: string; chapterId?: string },
  options?: MCPQueryOptions
) {
  return useMCPData(
    () => mcpClient.getNPECompliance(context),
    { ...options, enabled: options?.enabled !== false && (!!context.bookId || !!context.chapterId) }
  );
}

/**
 * Hook to fetch causality chains
 */
export function useCausalityChains(
  bookId: string | null,
  chapterId?: string,
  options?: MCPQueryOptions
) {
  return useMCPData(
    () => mcpClient.getCausalityChains(bookId!, chapterId),
    { ...options, enabled: options?.enabled !== false && !!bookId }
  );
}

/**
 * Hook to fetch character states (V1-V4)
 */
export function useCharacterStates(
  characterId: string | null,
  options?: MCPQueryOptions
) {
  return useMCPData(
    () => mcpClient.getCharacterStates(characterId!),
    { ...options, enabled: options?.enabled !== false && !!characterId }
  );
}

/**
 * Hook to fetch decision tree
 */
export function useDecisionTree(
  characterId: string | null,
  bookId?: string,
  options?: MCPQueryOptions
) {
  return useMCPData(
    () => mcpClient.getDecisionTree(characterId!, bookId),
    { ...options, enabled: options?.enabled !== false && !!characterId }
  );
}

/**
 * Hook to fetch pacing analysis
 */
export function usePacingAnalysis(
  bookId: string | null,
  options?: MCPQueryOptions
) {
  return useMCPData(
    () => mcpClient.getPacingAnalysis(bookId!),
    { ...options, enabled: options?.enabled !== false && !!bookId }
  );
}

/**
 * Hook to fetch information flow
 */
export function useInformationFlow(
  bookId: string | null,
  chapterId?: string,
  options?: MCPQueryOptions
) {
  return useMCPData(
    () => mcpClient.getInformationFlow(bookId!, chapterId),
    { ...options, enabled: options?.enabled !== false && !!bookId }
  );
}

/**
 * Hook to fetch POV bias data
 */
export function usePOVBias(
  bookId: string | null,
  characterId?: string,
  options?: MCPQueryOptions
) {
  return useMCPData(
    () => mcpClient.getPOVBias(bookId!, characterId),
    { ...options, enabled: options?.enabled !== false && !!bookId }
  );
}

/**
 * Hook to fetch dialogue physics
 */
export function useDialoguePhysics(
  sceneId: string | null,
  options?: MCPQueryOptions
) {
  return useMCPData(
    () => mcpClient.getDialoguePhysics(sceneId!),
    { ...options, enabled: options?.enabled !== false && !!sceneId }
  );
}

/**
 * Hook to fetch stakes/pressure data
 */
export function useStakesPressure(
  bookId: string | null,
  options?: MCPQueryOptions
) {
  return useMCPData(
    () => mcpClient.getStakesPressure(bookId!),
    { ...options, enabled: options?.enabled !== false && !!bookId }
  );
}
