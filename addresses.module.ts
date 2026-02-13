import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from './address.entity';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Address, User])],
  providers: [AddressesService],
  controllers: [AddressesController],
  exports: [TypeOrmModule, AddressesService],
})
export class AddressesModule {}
