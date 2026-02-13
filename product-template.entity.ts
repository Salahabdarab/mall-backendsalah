import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Store } from '../stores/store.entity';
import { Wing } from '../wings/wing.entity';

@Entity()
export class ProductTemplate {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index()
  @ManyToOne(() => Store, { nullable: false, onDelete: 'CASCADE' })
  store: Store;

  @Index()
  @ManyToOne(() => Wing, { nullable: true, onDelete: 'SET NULL' })
  wing: Wing | null;

  @Column() name: string;
  @Column({ default: true }) isActive: boolean;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
