import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from '../stores/store.entity';
import { Wing } from '../wings/wing.entity';
import { ProductTemplate } from './product-template.entity';
import { ProductTemplateField } from './product-template-field.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Store, Wing, ProductTemplate, ProductTemplateField, Product, ProductVariant])],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [TypeOrmModule, ProductsService],
})
export class ProductsModule {}
