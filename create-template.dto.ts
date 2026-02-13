import { IsOptional, IsString } from 'class-validator';
export class CreateTemplateDto { @IsString() storeId: string; @IsOptional() @IsString() wingId?: string; @IsString() name: string; }
