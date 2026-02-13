import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersScheduler } from './orders.scheduler';
import { CartItem } from '../cart/cart-item.entity';
import { ProductVariant } from '../products/product-variant.entity';
import { Product } from '../products/product.entity';
import { Store } from '../stores/store.entity';
import { Address } from '../addresses/address.entity';
import { ShippingMethod } from '../shipping/shipping-method.entity';
import { Coupon } from '../coupons/coupon.entity';
import { CouponsModule } from '../coupons/coupons.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, CartItem, ProductVariant, Product, Store, Address, ShippingMethod, Coupon]),
    CouponsModule,
    NotificationsModule,
  ],
  providers: [OrdersService, OrdersScheduler],
  controllers: [OrdersController],
  exports: [TypeOrmModule, OrdersService],
})
export class OrdersModule {}
