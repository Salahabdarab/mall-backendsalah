import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Role } from '../users/role.enum';

@Controller('shipping')
export class ShippingController {
  constructor(private svc: ShippingService) {}

  @Get('methods') list(@Query('storeId') storeId?: string) { return this.svc.listPublic(storeId); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN)
  @Post('methods') create(@Body() dto: any) { return this.svc.createForStore(dto); }
}
