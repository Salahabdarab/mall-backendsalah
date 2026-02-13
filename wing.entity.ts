import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
@Entity()
export class Wing {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index({ unique: true }) @Column() slug: string;
  @Column() name: string;
  @Column({ type:'text', nullable:true }) description: string|null;
  @Column({ default:true }) isActive: boolean;
  @Column({ type:'int', default:0 }) sortOrder: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
