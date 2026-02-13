import { IsInt, IsOptional, IsString, Min } from 'class-validator';
export class CreateVariantDto {
  @IsString() productId: string;
  @IsString() sku: string;
  options: any;
  @IsOptional() priceOverride?: string;
  @IsOptional() @IsInt() @Min(0) stock?: number;
}
