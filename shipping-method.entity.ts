import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Store } from '../stores/store.entity';

@Entity()
export class ShippingMethod {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index()
  @ManyToOne(() => Store, { nullable: true, onDelete: 'CASCADE' })
  store: Store | null;

  @Column() name: string;

  @Column({ type:'numeric', precision:12, scale:2, default:'0.00' })
  fee: string;

  @Column({ default:true }) isActive: boolean;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
