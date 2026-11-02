import bcrypt from 'bcryptjs';

export type UserRole = 'investor' | 'company' | 'admin' | 'user';

export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public readonly email: string,
    private passwordHash: string,
    public role: UserRole = 'user',
    public phone: string | null = null,
    public readonly createdAt: string = new Date().toISOString()
  ) {}

  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }

  public getPasswordHash(): string {
    return this.passwordHash;
  }

  public isAdmin(): boolean {
    return this.role === 'admin';
  }

  public isCompany(): boolean {
    return this.role === 'company';
  }

  public isInvestor(): boolean {
    return this.role === 'investor';
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      phone: this.phone,
      createdAt: this.createdAt
    };
  }
}
