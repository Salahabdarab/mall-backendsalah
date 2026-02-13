import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './coupon.entity';

@Injectable()
export class CouponsService {
  constructor(@InjectRepository(Coupon) private repo: Repository<Coupon>) {}

  async validate(code?: string) {
    if (!code) return null;
    const c = await this.repo.findOne({ where: { code: code.toUpperCase(), isActive: true } as any });
    return c || null;
  }

  async create(dto: any) {
    return this.repo.save(this.repo.create({
      code: String(dto.code).toUpperCase().trim(),
      percentOff: dto.percentOff ?? '0.00',
      maxDiscount: dto.maxDiscount ?? '0.00',
      isActive: true,
    }));
  }
}
