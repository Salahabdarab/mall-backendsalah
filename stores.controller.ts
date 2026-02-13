import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { StoresService } from './stores.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Role } from '../users/role.enum';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { SubmitStoreRequestDto } from './dto/submit-store-request.dto';
import { SendContractDto } from './dto/send-contract.dto';
import { SignContractDto } from './dto/sign-contract.dto';
import { ApproveRejectDto } from './dto/approve-reject.dto';
import { StoreRequestStatus } from './store-request.entity';

@Controller('stores')
export class StoresController {
  constructor(private svc: StoresService) {}

  @Get('by-wing/:wingId') byWing(@Param('wingId') wingId: string) { return this.svc.listStoresByWing(wingId); }

  @UseGuards(JwtAuthGuard)
  @Post('requests')
  submit(@CurrentUser() u: any, @Body() dto: SubmitStoreRequestDto) { return this.svc.submitRequest(u.id, dto); }

  @UseGuards(JwtAuthGuard)
  @Get('requests/me')
  myReq(@CurrentUser() u: any) { return this.svc.myRequests(u.id); }

  @UseGuards(JwtAuthGuard)
  @Post('requests/:id/sign')
  sign(@CurrentUser() u: any, @Param('id') id: string, @Body() _dto: SignContractDto) {
    return this.svc.tenantSign(id, u.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT)
  @Get('me')
  myStore(@CurrentUser() u: any) { return this.svc.myStore(u.id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/requests')
  adminReq(@Query('status') status?: StoreRequestStatus) { return this.svc.adminListRequests(status); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/requests/:id/contract')
  contract(@Param('id') id: string, @Body() dto: SendContractDto) { return this.svc.adminSendContract(id, dto); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/requests/:id/approve')
  approve(@Param('id') id: string, @Body() dto: ApproveRejectDto) { return this.svc.adminApprove(id, dto); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/requests/:id/reject')
  reject(@Param('id') id: string, @Body() dto: ApproveRejectDto) { return this.svc.adminReject(id, dto); }
}
