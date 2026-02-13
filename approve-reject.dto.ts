import { IsOptional, IsString } from 'class-validator';
export class ApproveRejectDto { @IsOptional() @IsString() adminNote?: string; }
