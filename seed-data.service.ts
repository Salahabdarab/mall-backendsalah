import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Role } from '../modules/users/role.enum';
import { User } from '../modules/users/user.entity';
import { Wing } from '../modules/wings/wing.entity';
import { Store } from '../modules/stores/store.entity';
import { ShippingMethod } from '../modules/shipping/shipping-method.entity';
import { ProductTemplate } from '../modules/products/product-template.entity';
import { ProductTemplateField, TemplateFieldType } from '../modules/products/product-template-field.entity';
import { Product } from '../modules/products/product.entity';
import { ProductVariant } from '../modules/products/product-variant.entity';

@Injectable()
export class SeedDataService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedDataService.name);

  constructor(private dataSource: DataSource) {}

  async onApplicationBootstrap() {
    const enabled = (process.env.SEED_ENABLED || 'false').toLowerCase() === 'true';
    const seedData = (process.env.SEED_DATA_ENABLED || 'true').toLowerCase() === 'true';
    if (!enabled || !seedData) {
      this.logger.log('Seed data disabled (set SEED_ENABLED=true and SEED_DATA_ENABLED=true)');
      return;
    }

    await this.seedWingsStoresShippingAndProducts();
  }

  private async seedWingsStoresShippingAndProducts() {
    await this.dataSource.transaction(async (tx) => {
      const usersRepo = tx.getRepository(User);
      const admin = await usersRepo.findOne({ where: { email: 'admin@test.com' } });
      const merchant = await usersRepo.findOne({ where: { email: 'merchant@test.com' } });
      const customer = await usersRepo.findOne({ where: { email: 'customer@test.com' } });

      if (!admin || !merchant || !customer) throw new Error('Seed users not found. Enable SeedService.');

      if (admin.role !== Role.ADMIN) admin.role = Role.ADMIN;
      if (merchant.role !== Role.MERCHANT) merchant.role = Role.MERCHANT;
      if (customer.role !== Role.CUSTOMER) customer.role = Role.CUSTOMER;
      await usersRepo.save([admin, merchant, customer]);

      const wingsRepo = tx.getRepository(Wing);
      const wingsToEnsure = [
        { slug: 'fashion', name: 'جناح الأزياء', description: 'ملابس رجالية ونسائية واكسسوارات', sortOrder: 10 },
        { slug: 'electronics', name: 'جناح الإلكترونيات', description: 'شاشات، سماعات، أجهزة ذكية', sortOrder: 20 },
        { slug: 'computers', name: 'جناح الكمبيوتر', description: 'لابتوبات، قطع، ملحقات', sortOrder: 30 },
      ];

      for (const w of wingsToEnsure) {
        const exists = await wingsRepo.findOne({ where: { slug: w.slug } as any });
        if (!exists) {
          await wingsRepo.save(wingsRepo.create({ slug: w.slug, name: w.name, description: w.description, sortOrder: w.sortOrder, isActive: true } as any));
          this.logger.log(`Created Wing: ${w.slug}`);
        }
      }

      const fashionWing = await wingsRepo.findOne({ where: { slug: 'fashion' } as any });
      if (!fashionWing) throw new Error('Fashion wing missing');

      const storesRepo = tx.getRepository(Store);
      const demoStoreCode = 'MALL-DEMO-000001';
      let demoStore = await storesRepo.findOne({ where: { code: demoStoreCode } as any, relations: ['owner', 'wing'] });

      if (!demoStore) {
        demoStore = await storesRepo.save(
          storesRepo.create({
            code: demoStoreCode,
            name: 'متجر فخم - Demo Fashion',
            description: 'متجر تجريبي لعرض الملابس بمقاسات ومتغيرات',
            owner: merchant,
            wing: fashionWing,
            isActive: true,
            isFeatured: true,
            featuredSortOrder: 1,
          } as any),
        );
        this.logger.log(`Created Store: ${demoStore.code}`);
      }

      const shipRepo = tx.getRepository(ShippingMethod);
      const globalShipName = 'Standard Delivery';
      const globalShip = await shipRepo.findOne({ where: { store: null as any, name: globalShipName } as any });
      if (!globalShip) {
        await shipRepo.save(shipRepo.create({ store: null, name: globalShipName, fee: '10.00', isActive: true } as any));
        this.logger.log(`Created ShippingMethod: ${globalShipName}`);
      }

      const tmplRepo = tx.getRepository(ProductTemplate);
      const fieldRepo = tx.getRepository(ProductTemplateField);

      let clothingTemplate = await tmplRepo.findOne({ where: { store: { id: demoStore.id } as any, name: 'Clothing Template' } as any, relations: ['store'] });
      if (!clothingTemplate) {
        clothingTemplate = await tmplRepo.save(tmplRepo.create({ store: demoStore, wing: fashionWing, name: 'Clothing Template', isActive: true } as any));
        this.logger.log(`Created Template: Clothing Template`);
      }

      const desiredFields = [
        { key: 'brand', label: 'الماركة', type: TemplateFieldType.TEXT, isRequired: false, sortOrder: 10 },
        { key: 'material', label: 'الخامة', type: TemplateFieldType.TEXT, isRequired: false, sortOrder: 20 },
        { key: 'gender', label: 'الفئة', type: TemplateFieldType.SELECT, isRequired: true, sortOrder: 30, options: ['رجالي', 'نسائي', 'أطفال'] },
        { key: 'color', label: 'اللون', type: TemplateFieldType.COLOR, isRequired: true, sortOrder: 40 },
        { key: 'size', label: 'المقاس', type: TemplateFieldType.SELECT, isRequired: true, sortOrder: 50, options: ['S', 'M', 'L', 'XL'] },
      ];

      for (const f of desiredFields) {
        const exists = await fieldRepo.findOne({ where: { template: { id: clothingTemplate.id } as any, key: f.key } as any });
        if (!exists) {
          await fieldRepo.save(fieldRepo.create({ template: clothingTemplate, key: f.key, label: f.label, type: f.type, isRequired: f.isRequired, options: (f as any).options ?? null, sortOrder: f.sortOrder } as any));
          this.logger.log(`Created TemplateField: ${f.key}`);
        }
      }

      const prodRepo = tx.getRepository(Product);
      const varRepo = tx.getRepository(ProductVariant);

      const demoProductTitle = 'تيشيرت فاخر - Demo Tee';
      let product = await prodRepo.findOne({ where: { store: { id: demoStore.id } as any, title: demoProductTitle } as any, relations: ['store', 'template'] });

      if (!product) {
        product = await prodRepo.save(prodRepo.create({
          store: demoStore,
          template: clothingTemplate,
          title: demoProductTitle,
          description: 'منتج تجريبي بمقاسات وألوان متعددة.',
          basePrice: '49.99',
          attributes: { brand: 'DEMO', material: 'Cotton', gender: 'رجالي' },
          imageKeys: [],
          mainImageKey: null,
          isActive: true,
          ratingAvg: '0.00',
          ratingCount: 0,
        } as any));
        this.logger.log(`Created Product: ${demoProductTitle}`);
      }

      const demoVariants = [
        { sku: 'DEMO-TEE-BLK-M', options: { color: '#000000', size: 'M' }, priceOverride: null, stock: 25 },
        { sku: 'DEMO-TEE-WHT-L', options: { color: '#FFFFFF', size: 'L' }, priceOverride: null, stock: 30 },
      ];

      for (const v of demoVariants) {
        const exists = await varRepo.findOne({ where: { product: { id: product.id } as any, sku: v.sku } as any });
        if (!exists) {
          await varRepo.save(varRepo.create({ product, sku: v.sku, options: v.options, priceOverride: v.priceOverride, stock: v.stock, isActive: true } as any));
          this.logger.log(`Created Variant: ${v.sku}`);
        }
      }
    });

    this.logger.log('Seed wings/stores/shipping/product completed ✅');
  }
}
