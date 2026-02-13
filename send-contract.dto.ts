import { IsInt, IsOptional, IsString, Min } from 'class-validator';
export class SendContractDto { @IsString() rentPrice: string; @IsInt() @Min(1) rentDurationMonths: number; @IsString() contractText: string; @IsOptional() @IsString() adminNote?: string; }
