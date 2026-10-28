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
    const analysis = ScamTypology.analyzePitch(text);
    return {
      ...analysis,
      reasoning: 'Evaluated against CBSL financial regulations and automated velocity checks'
    };
  }
}

export default new ChatbotService();
