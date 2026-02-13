import { IsInt, IsOptional, IsString, Min } from 'class-validator';
export class UpdateWingDto { @IsOptional() @IsString() slug?: string; @IsOptional() @IsString() name?: string; @IsOptional() @IsString() description?: string; @IsOptional() @IsInt() @Min(0) sortOrder?: number; @IsOptional() isActive?: boolean; }
