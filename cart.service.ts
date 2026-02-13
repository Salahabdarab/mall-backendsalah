import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart-item.entity';
import { User } from '../users/user.entity';
import { ProductVariant } from '../products/product-variant.entity';
import { Product } from '../products/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem) private repo: Repository<CartItem>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(ProductVariant) private varRepo: Repository<ProductVariant>,
    @InjectRepository(Product) private prodRepo: Repository<Product>,
  ) {}

  async getCart(userId: string) {
    const items = await this.repo.find({ where: { user: { id: userId } as any } as any, relations: ['variant', 'variant.product'] });
    return items.map(i => ({
      id: i.id,
      quantity: i.quantity,
      variant: {
        id: i.variant.id,
        sku: i.variant.sku,
        options: i.variant.options,
        priceOverride: i.variant.priceOverride,
        stock: i.variant.stock,
        product: {
          id: (i.variant as any).product?.id,
          title: (i.variant as any).product?.title,
          basePrice: (i.variant as any).product?.basePrice,
        },
      },
    }));
  }

  async addItem(userId: string, variantId: string, quantity: number) {
    const user = await this.usersRepo.findOne({ where: { id: userId } as any });
    if (!user) throw new NotFoundException('User not found');
    const variant = await this.varRepo.findOne({ where: { id: variantId } as any, relations: ['product'] });
    if (!variant || !variant.isActive) throw new NotFoundException('Variant not found');
    const qty = Math.max(1, Number(quantity || 1));
    if (variant.stock < qty) throw new BadRequestException('Not enough stock');

    const existing = await this.repo.findOne({ where: { user: { id: userId } as any, variant: { id: variantId } as any } as any });
    if (existing) {
      const newQty = existing.quantity + qty;
      if (variant.stock < newQty) throw new BadRequestException('Not enough stock');
      existing.quantity = newQty;
      return this.repo.save(existing);
    }
    return this.repo.save(this.repo.create({ user, variant, quantity: qty }));
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.repo.findOne({ where: { id: itemId } as any, relations: ['user'] });
    if (!item || item.user.id !== userId) throw new NotFoundException('Cart item not found');
    await this.repo.remove(item);
    return { ok: true };
  }

  async clear(userId: string) {
    await this.repo.delete({ user: { id: userId } as any } as any);
    return { ok: true };
  }
}
