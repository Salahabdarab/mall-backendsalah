import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingMethod } from './shipping-method.entity';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { Store } from '../stores/store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingMethod, Store])],
  providers: [ShippingService],
  controllers: [ShippingController],
  exports: [TypeOrmModule, ShippingService],
})
export class ShippingModule {}
