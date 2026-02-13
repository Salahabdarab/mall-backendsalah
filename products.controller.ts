import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Role } from '../users/role.enum';
import { CreateTemplateDto } from './dto/create-template.dto';
import { CreateTemplateFieldDto } from './dto/create-template-field.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';

@Controller('products')
export class ProductsController {
  constructor(private svc: ProductsService) {}

  @Get('store/:storeId') listByStore(@Param('storeId') storeId: string) { return this.svc.listPublicByStore(storeId); }
  @Get('search') search(@Query('q') q: string) { return this.svc.listPublicSearch(String(q || '')); }
  @Get(':id') get(@Param('id') id: string) { return this.svc.getProduct(id); }

  // Merchant APIs
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.MERCHANT)
  @Get('merchant/store/:storeId') merchantList(@Param('storeId') storeId: string) { return this.svc.merchantListProducts(storeId); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.MERCHANT)
  @Post('merchant/templates') createTemplate(@Body() dto: CreateTemplateDto) { return this.svc.createTemplate(dto); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.MERCHANT)
  @Post('merchant/templates/fields') addField(@Body() dto: CreateTemplateFieldDto) { return this.svc.addTemplateField(dto); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.MERCHANT)
  @Post('merchant') createProduct(@Body() dto: CreateProductDto) { return this.svc.createProduct(dto); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.MERCHANT)
  @Post('merchant/variants') addVariant(@Body() dto: CreateVariantDto) { return this.svc.addVariant(dto); }
}
