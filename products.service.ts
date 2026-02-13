import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../stores/store.entity';
import { Wing } from '../wings/wing.entity';
import { ProductTemplate } from './product-template.entity';
import { ProductTemplateField } from './product-template-field.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Store) private storesRepo: Repository<Store>,
    @InjectRepository(Wing) private wingsRepo: Repository<Wing>,
    @InjectRepository(ProductTemplate) private tmplRepo: Repository<ProductTemplate>,
    @InjectRepository(ProductTemplateField) private fieldRepo: Repository<ProductTemplateField>,
    @InjectRepository(Product) private prodRepo: Repository<Product>,
    @InjectRepository(ProductVariant) private varRepo: Repository<ProductVariant>,
  ) {}

  async listPublicByStore(storeId: string) {
    return this.prodRepo.find({ where: { store: { id: storeId } as any, isActive: true } as any, order: { createdAt: 'DESC' } as any });
  }

  async listPublicSearch(q: string) {
    // basic search: title ILIKE
    return this.prodRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.store', 's')
      .where('p.isActive = true')
      .andWhere('p.title ILIKE :q', { q: `%${q}%` })
      .orderBy('p.createdAt', 'DESC')
      .limit(50)
      .getMany();
  }

  async merchantListProducts(storeId: string) {
    return this.prodRepo.find({ where: { store: { id: storeId } as any } as any, order: { createdAt: 'DESC' } as any });
  }

  async createTemplate(dto: any) {
    const store = await this.storesRepo.findOne({ where: { id: dto.storeId } as any });
    if (!store) throw new NotFoundException('Store not found');
    const wing = dto.wingId ? await this.wingsRepo.findOne({ where: { id: dto.wingId } as any }) : null;
    return this.tmplRepo.save(this.tmplRepo.create({ store, wing: wing || null, name: dto.name.trim(), isActive: true }));
  }

  async addTemplateField(dto: any) {
    const tmpl = await this.tmplRepo.findOne({ where: { id: dto.templateId } as any });
    if (!tmpl) throw new NotFoundException('Template not found');
    const exists = await this.fieldRepo.findOne({ where: { template: { id: tmpl.id } as any, key: dto.key } as any });
    if (exists) throw new BadRequestException('Field key already exists');
    return this.fieldRepo.save(this.fieldRepo.create({
      template: tmpl,
      key: dto.key.trim(),
      label: dto.label.trim(),
      type: dto.type,
      options: dto.options ?? null,
      isRequired: !!dto.isRequired,
      sortOrder: dto.sortOrder ?? 0,
    }));
  }

  async createProduct(dto: any) {
    const store = await this.storesRepo.findOne({ where: { id: dto.storeId } as any });
    if (!store) throw new NotFoundException('Store not found');
    const tmpl = dto.templateId ? await this.tmplRepo.findOne({ where: { id: dto.templateId } as any }) : null;
    return this.prodRepo.save(this.prodRepo.create({
      store,
      template: tmpl || null,
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      basePrice: dto.basePrice ?? '0.00',
      attributes: dto.attributes ?? null,
      imageKeys: [],
      mainImageKey: null,
      isActive: true,
      ratingAvg: '0.00',
      ratingCount: 0,
    }));
  }

  async addVariant(dto: any) {
    const product = await this.prodRepo.findOne({ where: { id: dto.productId } as any });
    if (!product) throw new NotFoundException('Product not found');
    const exists = await this.varRepo.findOne({ where: { product: { id: product.id } as any, sku: dto.sku } as any });
    if (exists) throw new BadRequestException('SKU already exists');
    return this.varRepo.save(this.varRepo.create({
      product,
      sku: dto.sku.trim(),
      options: dto.options ?? {},
      priceOverride: dto.priceOverride ?? null,
      stock: dto.stock ?? 0,
      isActive: true,
    }));
  }

  async getProduct(productId: string) {
    const p = await this.prodRepo.findOne({ where: { id: productId } as any, relations: ['store', 'template'] });
    if (!p) throw new NotFoundException('Product not found');
    const variants = await this.varRepo.find({ where: { product: { id: p.id } as any, isActive: true } as any, order: { createdAt: 'ASC' } as any });
    return { ...p, variants };
  }
}
