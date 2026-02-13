import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Address {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index()
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @Column() fullName: string;
  @Column() phone: string;
  @Column() city: string;
  @Column() street: string;

  @Column({ nullable: true }) notes: string | null;

  @Column({ default: false }) isDefault: boolean;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
