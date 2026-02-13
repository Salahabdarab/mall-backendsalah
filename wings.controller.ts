import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { WingsService } from './wings.service';
import { CreateWingDto } from './dto/create-wing.dto';
import { UpdateWingDto } from './dto/update-wing.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Role } from '../users/role.enum';
@Controller('wings')
export class WingsController {
  constructor(private svc: WingsService) {}
  @Get() listPublic(){ return this.svc.listPublic(); }
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) @Get('admin/all') listAdmin(){ return this.svc.listAdmin(); }
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) @Post() create(@Body() dto: CreateWingDto){ return this.svc.create(dto); }
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) @Put(':id') update(@Param('id') id:string,@Body() dto:UpdateWingDto){ return this.svc.update(id,dto); }
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) @Delete(':id') remove(@Param('id') id:string){ return this.svc.remove(id); }
}
