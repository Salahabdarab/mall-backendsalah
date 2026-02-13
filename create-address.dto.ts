import { IsBoolean, IsOptional, IsString } from 'class-validator';
export class CreateAddressDto { @IsString() fullName: string; @IsString() phone: string; @IsString() city: string; @IsString() street: string; @IsOptional() @IsString() notes?: string; @IsOptional() @IsBoolean() isDefault?: boolean; }
