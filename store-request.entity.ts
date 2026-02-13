import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';
import { Wing } from '../wings/wing.entity';
export enum StoreRequestStatus { SUBMITTED='SUBMITTED', CONTRACT_SENT='CONTRACT_SENT', SIGNED_BY_TENANT='SIGNED_BY_TENANT', APPROVED='APPROVED', REJECTED='REJECTED' }
@Entity()
export class StoreRequest {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @ManyToOne(()=>User,{nullable:false,onDelete:'CASCADE'}) applicant: User;
  @Index() @ManyToOne(()=>Wing,{nullable:false,onDelete:'RESTRICT'}) wing: Wing;
  @Column() desiredStoreName: string;
  @Column({type:'text',nullable:true}) businessDescription: string|null;
  @Column({nullable:true}) phone: string|null;
  @Column({type:'numeric',precision:12,scale:2,nullable:true}) rentPrice: string|null;
  @Column({type:'int',nullable:true}) rentDurationMonths: number|null;
  @Column({type:'text',nullable:true}) contractText: string|null;
  @Column({type:'timestamp',nullable:true}) contractSentAt: Date|null;
  @Column({type:'timestamp',nullable:true}) tenantSignedAt: Date|null;
  @Column({type:'varchar',default:StoreRequestStatus.SUBMITTED}) status: StoreRequestStatus;
  @Column({type:'text',nullable:true}) adminNote: string|null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
