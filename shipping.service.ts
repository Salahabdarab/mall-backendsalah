import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingMethod } from './shipping-method.entity';
import { Store } from '../stores/store.entity';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(ShippingMethod) private repo: Repository<ShippingMethod>,
    @InjectRepository(Store) private storesRepo: Repository<Store>,
  ) {}

  listPublic(storeId?: string) {
    if (storeId) {
      return this.repo.find({ where: [{ store: null } as any, { store: { id: storeId } as any } as any] as any, order: { createdAt: 'DESC' } as any });
    }
    return this.repo.find({ where: { store: null } as any, order: { createdAt: 'DESC' } as any });
  }

  async createForStore(dto: any) {
    const store = dto.storeId ? await this.storesRepo.findOne({ where: { id: dto.storeId } as any }) : null;
    return this.repo.save(this.repo.create({ store: store || null, name: dto.name.trim(), fee: dto.fee ?? '0.00', isActive: true }));
  }
}
