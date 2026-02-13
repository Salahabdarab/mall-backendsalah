import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';
import { ProductVariant } from '../products/product-variant.entity';

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index()
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @Index()
  @ManyToOne(() => ProductVariant, { nullable: false, onDelete: 'CASCADE' })
  variant: ProductVariant;

  @Column({ type:'int', default:1 }) quantity: number;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
