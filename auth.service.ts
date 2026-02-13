import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { Role } from '../users/role.enum';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}
  async register(email: string, password: string) {
    const existing = await this.users.findByEmail(email);
    if (existing) throw new BadRequestException('Email already used');
    const passwordHash = await bcrypt.hash(password, 10);
    const u = await this.users.create(email, passwordHash, Role.CUSTOMER);
    return this.issue(u);
  }
  async login(email: string, password: string) {
    const u = await this.users.findByEmail(email);
    if (!u || !u.isActive) throw new BadRequestException('Invalid credentials');
    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) throw new BadRequestException('Invalid credentials');
    return this.issue(u);
  }
  private issue(u: any) {
    const payload = { sub: u.id, email: u.email, role: u.role };
    const accessToken = this.jwt.sign(payload);
    return { accessToken, user: { id: u.id, email: u.email, role: u.role } };
  }
}
