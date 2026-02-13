import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Store } from '../stores/store.entity';
import { ProductTemplate } from './product-template.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index()
  @ManyToOne(() => Store, { nullable: false, onDelete: 'CASCADE' })
  store: Store;

  @Index()
  @ManyToOne(() => ProductTemplate, { nullable: true, onDelete: 'SET NULL' })
  template: ProductTemplate | null;

  @Column() title: string;
  @Column({ type:'text', nullable:true }) description: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: '0.00' })
  basePrice: string;

  @Column({ type: 'jsonb', nullable: true }) attributes: any | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  imageKeys: string[];

  @Column({ nullable: true }) mainImageKey: string | null;

  @Column({ default: true }) isActive: boolean;

  @Column({ type: 'numeric', precision: 4, scale: 2, default: '0.00' })
  ratingAvg: string;

  @Column({ type: 'int', default: 0 })
  ratingCount: number;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
