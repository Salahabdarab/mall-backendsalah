import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index()
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @Column() title: string;
  @Column({ type:'text', nullable:true }) body: string|null;

  @Column({ type:'jsonb', nullable:true }) data: any|null;

  @Column({ default:false }) isRead: boolean;

  @CreateDateColumn() createdAt: Date;
}
