import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { CartService } from './cart.service';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private svc: CartService) {}

  @Get() get(@CurrentUser() u:any) { return this.svc.getCart(u.id); }

  @Post('add') add(@CurrentUser() u:any, @Body() dto: any) {
    return this.svc.addItem(u.id, dto.variantId, dto.quantity ?? 1);
  }

  @Delete(':id') remove(@CurrentUser() u:any, @Param('id') id: string) { return this.svc.removeItem(u.id, id); }

  @Post('clear') clear(@CurrentUser() u:any) { return this.svc.clear(u.id); }
}
