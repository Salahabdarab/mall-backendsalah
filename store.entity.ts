import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';
import { Wing } from '../wings/wing.entity';
@Entity()
export class Store {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index({unique:true}) @Column() code: string;
  @Column() name: string;
  @Column({type:'text',nullable:true}) description: string|null;
  @Index() @ManyToOne(()=>User,{nullable:false,onDelete:'CASCADE'}) owner: User;
  @Index() @ManyToOne(()=>Wing,{nullable:false,onDelete:'RESTRICT'}) wing: Wing;
  @Column({default:true}) isActive: boolean;
  @Column({default:false}) isFeatured: boolean;
  @Column({type:'int',default:0}) featuredSortOrder: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
