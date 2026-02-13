import { Module } from '@nestjs/common';
import { UsersModule } from '../modules/users/users.module';
import { SeedService } from './seed.service';
import { SeedDataService } from './seed-data.service';

@Module({
  imports: [UsersModule],
  providers: [SeedService, SeedDataService],
})
export class SeedModule {}
