import { ScamTypology } from '../domain/ScamTypology';

export class ChatbotService {
  public getMcpStatus() {
    return { message: 'mcp API is working (scaffolded)' };
  }

  public getChatbotStatus() {
    return { message: 'chatbot API is working (scaffolded)' };
  }

  public getScamStatus() {
    return { message: 'scam API is working (scaffolded)' };
  }

  public checkScam(text: string) {
    if (!text || typeof text !== 'string' || !text.trim()) {
      throw new Error('text is required for scam analysis');
    }
    const analysis = ScamTypology.analyzePitch(text);
    return {
      ...analysis,
      reasoning: 'Evaluated against CBSL financial regulations and automated velocity checks',
      cbslReference: 'CBSL Direction No. 02 of 2023 on Unauthorized Schemes',
    };
  }

  public queryMcp(method: string, params: Record<string, unknown> = {}) {
    if (!method) {
      throw new Error('JSON-RPC method is required');
    }
    return {
      jsonrpc: '2.0',
      result: {
        method,
        params,
        status: 'SCAFFOLD_MOCK',
        isMock: true,
        message: 'MCP tool router stub — live database & CBSL RAG tools will be enabled in Checkpoint 2',
      },
    };
  }
}

export default new ChatbotService();
