import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { TemplateFieldType } from '../product-template-field.entity';
export class CreateTemplateFieldDto {
  @IsString() templateId: string;
  @IsString() key: string;
  @IsString() label: string;
  @IsString() type: TemplateFieldType;
  @IsOptional() options?: any[];
  @IsOptional() @IsBoolean() isRequired?: boolean;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}
