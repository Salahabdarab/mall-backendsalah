import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity()
export class Coupon {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index({ unique: true })
  @Column() code: string;

  @Column({ type:'numeric', precision:5, scale:2, default:'0.00' })
  percentOff: string;

  @Column({ type:'numeric', precision:12, scale:2, default:'0.00' })
  maxDiscount: string;

  @Column({ default:true }) isActive: boolean;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
