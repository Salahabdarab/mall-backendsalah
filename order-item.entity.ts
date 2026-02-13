import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, Index } from 'typeorm';
import { Order } from './order.entity';
import { ProductVariant } from '../products/product-variant.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index()
  @ManyToOne(()=>Order,{nullable:false,onDelete:'CASCADE'}) order: Order;

  @Index()
  @ManyToOne(()=>ProductVariant,{nullable:false,onDelete:'RESTRICT'}) variant: ProductVariant;

  @Column({ type:'int', default:1 }) quantity: number;
  @Column({ type:'numeric', precision:12, scale:2, default:'0.00' }) unitPrice: string;

  @CreateDateColumn() createdAt: Date;
}
