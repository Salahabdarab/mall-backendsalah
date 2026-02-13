import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';

@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private svc: AddressesService) {}
  @Get() list(@CurrentUser() u:any) { return this.svc.list(u.id); }
  @Post() create(@CurrentUser() u:any, @Body() dto: CreateAddressDto) { return this.svc.create(u.id, dto); }
}
