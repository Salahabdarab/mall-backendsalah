import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { WingsModule } from './modules/wings/wings.module';
import { StoresModule } from './modules/stores/stores.module';
import { ProductsModule } from './modules/products/products.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    WingsModule,
    StoresModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    AddressesModule,
    ShippingModule,
    CouponsModule,
    NotificationsModule,
    SeedModule,
  ],
})
export class AppModule {}
