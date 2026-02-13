import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from '../users/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private repo: Repository<Notification>,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async list(userId: string) {
    return this.repo.find({ where: { user: { id: userId } as any } as any, order: { createdAt: 'DESC' } as any, take: 100 });
  }

  async create(userId: string, title: string, body?: string, data?: any) {
    const user = await this.usersRepo.findOne({ where: { id: userId } as any });
    if (!user) return null;
    return this.repo.save(this.repo.create({ user, title, body: body ?? null, data: data ?? null, isRead: false }));
  }
}
