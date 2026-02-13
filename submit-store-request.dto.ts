import { IsOptional, IsString } from 'class-validator';
export class SubmitStoreRequestDto { @IsString() wingId: string; @IsString() desiredStoreName: string; @IsOptional() @IsString() businessDescription?: string; @IsOptional() @IsString() phone?: string; }
