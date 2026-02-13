import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { OrdersService } from './orders.service';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private svc: OrdersService) {}

  @Get('me')
  myOrders(@CurrentUser() u:any) { return this.svc.myOrders(u.id); }

  @Post('checkout')
  checkout(@CurrentUser() u:any, @Body() dto: any) { return this.svc.createFromCart(u.id, dto); }

  // Demo payment hook: mark paid
  @Post(':id/pay')
  pay(@CurrentUser() u:any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.markPaid(u.id, id, dto?.paymentRef);
  }
}
