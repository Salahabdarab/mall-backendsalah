import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './address.entity';
import { User } from '../users/user.entity';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address) private repo: Repository<Address>,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async list(userId: string) {
    return this.repo.find({ where: { user: { id: userId } as any } as any, order: { isDefault: 'DESC', createdAt: 'DESC' } as any });
  }

  async create(userId: string, dto: any) {
    const user = await this.usersRepo.findOne({ where: { id: userId } as any });
    if (!user) throw new NotFoundException('User not found');
    if (dto.isDefault) {
      await this.repo.update({ user: { id: userId } as any } as any, { isDefault: false } as any);
    }
    return this.repo.save(this.repo.create({
      user,
      fullName: dto.fullName.trim(),
      phone: dto.phone.trim(),
      city: dto.city.trim(),
      street: dto.street.trim(),
      notes: dto.notes?.trim() || null,
      isDefault: !!dto.isDefault,
    }));
  }
}
