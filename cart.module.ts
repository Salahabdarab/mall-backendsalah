import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './cart-item.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { User } from '../users/user.entity';
import { ProductVariant } from '../products/product-variant.entity';
import { Product } from '../products/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem, User, ProductVariant, Product])],
  providers: [CartService],
  controllers: [CartController],
  exports: [TypeOrmModule, CartService],
})
export class CartModule {}
