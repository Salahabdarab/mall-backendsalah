import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index()
  @ManyToOne(() => Product, { nullable: false, onDelete: 'CASCADE' })
  product: Product;

  @Index()
  @Column() sku: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  options: any;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  priceOverride: string | null;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
