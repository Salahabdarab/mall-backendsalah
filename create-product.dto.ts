import { IsOptional, IsString } from 'class-validator';
export class CreateProductDto {
  @IsString() storeId: string;
  @IsOptional() @IsString() templateId?: string;
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() basePrice?: string;
  @IsOptional() attributes?: any;
}
