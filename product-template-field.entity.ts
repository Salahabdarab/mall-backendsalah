import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ProductTemplate } from './product-template.entity';

export enum TemplateFieldType { TEXT='TEXT', NUMBER='NUMBER', SELECT='SELECT', COLOR='COLOR', BOOLEAN='BOOLEAN' }

@Entity()
export class ProductTemplateField {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index()
  @ManyToOne(() => ProductTemplate, { nullable: false, onDelete: 'CASCADE' })
  template: ProductTemplate;

  @Index()
  @Column() key: string;

  @Column() label: string;
  @Column({ type: 'varchar', default: TemplateFieldType.TEXT }) type: TemplateFieldType;

  @Column({ default: false }) isRequired: boolean;

  @Column({ type: 'jsonb', nullable: true }) options: any[] | null;

  @Column({ type: 'int', default: 0 }) sortOrder: number;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
