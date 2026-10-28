import db from '../shared/db';
import { User, UserRole } from '../domain/User';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: User): Promise<User>;
}

export class UserRepository implements IUserRepository {
  public async findByEmail(email: string): Promise<User | null> {
    const res = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!res.rows || res.rows.length === 0) return null;
    return this.mapRowToUser(res.rows[0]);
  }

  public async findById(id: string): Promise<User | null> {
    const res = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (!res.rows || res.rows.length === 0) return null;
    return this.mapRowToUser(res.rows[0]);
  }

  public async create(user: User): Promise<User> {
    await db.query(
      'INSERT INTO users (id, name, email, password, role, phone, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [user.id, user.name, user.email, user.getPasswordHash(), user.role, user.phone, user.createdAt]
    );
    return user;
  }

  private mapRowToUser(row: any): User {
    return new User(row.id, row.name, row.email, row.password, row.role as UserRole, row.phone, row.created_at);
  }
}

export default new UserRepository();
