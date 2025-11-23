/**
 * MCP Client Service
 *
 * Connects to MCP Writing Servers running in MCP-Electron-App (FictionLab).
 * Provides methods to query NPE data from the various MCP servers.
 *
 * MCP Servers (ports 3001-3009):
 * - author-server (3001)
 * - series-planning-server (3002)
 * - book-planning-server (3003)
 * - chapter-planning-server (3004)
 * - character-planning-server (3005)
 * - scene-server (3006)
 * - core-continuity-server (3007)
 * - review-server (3008)
 * - reporting-server (3009)
 */

export interface MCPConfig {
  baseUrls: {
    author: string;
    seriesPlanning: string;
    bookPlanning: string;
    chapterPlanning: string;
    characterPlanning: string;
    scene: string;
    continuity: string;
    review: string;
    reporting: string;
  };
  authToken?: string;
}

const DEFAULT_MCP_CONFIG: MCPConfig = {
  baseUrls: {
    author: 'http://localhost:3001',
    seriesPlanning: 'http://localhost:3002',
    bookPlanning: 'http://localhost:3003',
    chapterPlanning: 'http://localhost:3004',
    characterPlanning: 'http://localhost:3005',
    scene: 'http://localhost:3006',
    continuity: 'http://localhost:3007',
    review: 'http://localhost:3008',
    reporting: 'http://localhost:3009',
  },
  authToken: process.env.MCP_AUTH_TOKEN,
};

class MCPClient {
  private config: MCPConfig;

  constructor(config: MCPConfig = DEFAULT_MCP_CONFIG) {
    this.config = config;
  }

  /**
   * Generic method to call an MCP tool
   */
  private async callTool<T>(
    serverUrl: string,
    toolName: string,
    params: Record<string, unknown> = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.config.authToken) {
      headers['Authorization'] = `Bearer ${this.config.authToken}`;
    }

    const response = await fetch(`${serverUrl}/tools/${toolName}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`MCP call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data as T;
  }

  /**
   * Get plot threads for tension graph
   */
  async getPlotThreads(bookId: string) {
    return this.callTool(
      this.config.baseUrls.bookPlanning,
      'get_plot_threads',
      { book_id: bookId }
    );
  }

  /**
   * Get tension/pressure data for a plot thread
   */
  async getTensionData(bookId: string, threadId?: string) {
    return this.callTool(
      this.config.baseUrls.reporting,
      'get_tension_data',
      { book_id: bookId, thread_id: threadId }
    );
  }

  /**
   * Get NPE compliance summary
   */
  async getNPECompliance(context: { bookId?: string; chapterId?: string }) {
    return this.callTool(
      this.config.baseUrls.review,
      'get_npe_compliance_summary',
      context
    );
  }

  /**
   * Get causality chains
   */
  async getCausalityChains(bookId: string, chapterId?: string) {
    return this.callTool(
      this.config.baseUrls.continuity,
      'get_causality_chains',
      { book_id: bookId, chapter_id: chapterId }
    );
  }

  /**
   * Get character state data (V1-V4 progression)
   */
  async getCharacterStates(characterId: string) {
    return this.callTool(
      this.config.baseUrls.characterPlanning,
      'get_character_states',
      { character_id: characterId }
    );
  }

  /**
   * Get decision tree for a character
   */
  async getDecisionTree(characterId: string, bookId?: string) {
    return this.callTool(
      this.config.baseUrls.continuity,
      'get_decision_tree',
      { character_id: characterId, book_id: bookId }
    );
  }

  /**
   * Get pacing analysis
   */
  async getPacingAnalysis(bookId: string) {
    return this.callTool(
      this.config.baseUrls.reporting,
      'get_pacing_analysis',
      { book_id: bookId }
    );
  }

  /**
   * Get information flow data
   */
  async getInformationFlow(bookId: string, chapterId?: string) {
    return this.callTool(
      this.config.baseUrls.continuity,
      'get_information_flow',
      { book_id: bookId, chapter_id: chapterId }
    );
  }

  /**
   * Get POV bias tracking data
   */
  async getPOVBias(bookId: string, characterId?: string) {
    return this.callTool(
      this.config.baseUrls.scene,
      'get_pov_bias',
      { book_id: bookId, character_id: characterId }
    );
  }

  /**
   * Get dialogue physics validation
   */
  async getDialoguePhysics(sceneId: string) {
    return this.callTool(
      this.config.baseUrls.review,
      'get_dialogue_physics',
      { scene_id: sceneId }
    );
  }

  /**
   * Get stakes/pressure data
   */
  async getStakesPressure(bookId: string) {
    return this.callTool(
      this.config.baseUrls.reporting,
      'get_stakes_pressure',
      { book_id: bookId }
    );
  }
}

// Singleton instance
export const mcpClient = new MCPClient();
