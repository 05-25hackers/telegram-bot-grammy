import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export enum ImportanceLevel {
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low',
}

export class CreateTaskDto {
    @IsString()
    name: string

    @IsString()
    @IsOptional()
    description?: string

    @IsEnum(ImportanceLevel, {
        message: 'Importance level must be: high, medium, or low',
    })
    @IsNotEmpty()
    importanceLevel: ImportanceLevel;

    @IsNotEmpty()
    chatId: number;
}

export class UpdateTaskDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(ImportanceLevel)
    @IsOptional()
    importanceLevel?: ImportanceLevel;

    @IsOptional()
    chatId?: number;
}