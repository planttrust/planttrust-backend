import { Request, Response } from 'express';
import authService, { AuthService } from '../services/AuthService';

export class AuthController {
  constructor(private service: AuthService = authService) {}

  public getStatus(req: Request, res: Response): void {
    res.json({ message: 'auth API is working' });
  }

  public async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.service.register(req.body);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || 'Server error' });
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.service.login(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || 'Server error' });
    }
  }
}

export default new AuthController();
