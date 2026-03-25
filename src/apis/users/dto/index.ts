import {IsNumber, IsString} from 'class-validator'

export class CreateUserDto {
    @IsString()
    name: string
    @IsString()
    surname: string

    @IsString()
    phone: string

    @IsNumber()
    chatId: number
}