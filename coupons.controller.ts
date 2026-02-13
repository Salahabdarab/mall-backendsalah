import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Role } from '../users/role.enum';

@Controller('coupons')
export class CouponsController {
  constructor(private svc: CouponsService) {}

  @Get('validate') validate(@Query('code') code?: string) { return this.svc.validate(code); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN)
  @Post() create(@Body() dto: any) { return this.svc.create(dto); }
}
