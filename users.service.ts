import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.enum';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}
  async findByEmail(email: string) { return this.repo.findOne({ where: { email: email.toLowerCase().trim() } }); }
  async findById(id: string) { const u = await this.repo.findOne({ where: { id } }); if (!u) throw new NotFoundException('User not found'); return u; }
  async create(email: string, passwordHash: string, role: Role = Role.CUSTOMER) { return this.repo.save(this.repo.create({ email: email.toLowerCase().trim(), passwordHash, role, isActive: true })); }
  async promoteToMerchant(userId: string) { await this.repo.update({ id: userId } as any, { role: Role.MERCHANT } as any); return this.findById(userId); }
}
