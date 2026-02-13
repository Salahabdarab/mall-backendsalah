import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './store.entity';
import { StoreRequest } from './store-request.entity';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { User } from '../users/user.entity';
import { Wing } from '../wings/wing.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Store, StoreRequest, User, Wing]), UsersModule],
  providers: [StoresService],
  controllers: [StoresController],
  exports: [TypeOrmModule, StoresService],
})
export class StoresModule {}
