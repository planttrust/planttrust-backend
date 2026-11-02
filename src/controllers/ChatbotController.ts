import { Request, Response } from 'express';
import chatbotService, { ChatbotService } from '../services/ChatbotService';

export class ChatbotController {
  constructor(private service: ChatbotService = chatbotService) {}

  public getMcp(req: Request, res: Response): void {
    res.json(this.service.getMcpStatus());
  }

  public queryMcp(req: Request, res: Response): void {
    try {
      const { method, params } = req.body || {};
      res.json(this.service.queryMcp(method, params));
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Invalid MCP query' });
    }
  }

  public getChatbot(req: Request, res: Response): void {
    res.json(this.service.getChatbotStatus());
  }

  public getScam(req: Request, res: Response): void {
    res.json(this.service.getScamStatus());
  }

  public checkScam(req: Request, res: Response): void {
    try {
      const { text } = req.body || {};
      res.json(this.service.checkScam(text));
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Invalid scam check request' });
    }
  }
}

export default new ChatbotController();
