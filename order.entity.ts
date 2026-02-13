import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';
import { Store } from '../stores/store.entity';
import { Address } from '../addresses/address.entity';
import { ShippingMethod } from '../shipping/shipping-method.entity';
import { Coupon } from '../coupons/coupon.entity';

export enum OrderStatus { PENDING='PENDING', PAID='PAID', CANCELLED='CANCELLED', SHIPPED='SHIPPED', COMPLETED='COMPLETED' }

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index() @ManyToOne(()=>User,{nullable:false,onDelete:'CASCADE'}) user: User;
  @Index() @ManyToOne(()=>Store,{nullable:false,onDelete:'RESTRICT'}) store: Store;

  @Index() @ManyToOne(()=>Address,{nullable:true,onDelete:'SET NULL'}) shippingAddress: Address|null;
  @Index() @ManyToOne(()=>ShippingMethod,{nullable:true,onDelete:'SET NULL'}) shippingMethod: ShippingMethod|null;
  @Index() @ManyToOne(()=>Coupon,{nullable:true,onDelete:'SET NULL'}) coupon: Coupon|null;

  @Column({ type:'varchar', default: OrderStatus.PENDING }) status: OrderStatus;

  @Column({ type:'numeric', precision:12, scale:2, default:'0.00' }) subtotal: string;
  @Column({ type:'numeric', precision:12, scale:2, default:'0.00' }) shippingFee: string;
  @Column({ type:'numeric', precision:12, scale:2, default:'0.00' }) discount: string;
  @Column({ type:'numeric', precision:12, scale:2, default:'0.00' }) total: string;

  @Column({ type:'timestamp', nullable:true }) reservedUntil: Date|null;

  @Column({ nullable:true }) paymentRef: string|null;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
