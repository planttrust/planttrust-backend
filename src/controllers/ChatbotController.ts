import { Request, Response } from 'express';
import chatbotService, { ChatbotService } from '../services/ChatbotService';

export class ChatbotController {
  constructor(private service: ChatbotService = chatbotService) {}

  public getMcp(req: Request, res: Response): void {
    res.json(this.service.getMcpStatus());
  }

  public getChatbot(req: Request, res: Response): void {
    res.json(this.service.getChatbotStatus());
  }

  public getScam(req: Request, res: Response): void {
    res.json(this.service.getScamStatus());
  }
}

export default new ChatbotController();
