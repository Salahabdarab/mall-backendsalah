import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wing } from './wing.entity';
import { WingsService } from './wings.service';
import { WingsController } from './wings.controller';
@Module({ imports:[TypeOrmModule.forFeature([Wing])], providers:[WingsService], controllers:[WingsController], exports:[TypeOrmModule, WingsService] })
export class WingsModule {}
