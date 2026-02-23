import { InputType, Field, ID, PartialType, OmitType } from "@nestjs/graphql";
import { 
    IsNotEmpty,
    IsString,
    IsUUID,
    IsInt,
    IsPositive,
    IsOptional,
    Length,
    IsDate,
} from "class-validator";

@InputType()
export class CreateTechnicianInput {
    @Field(() => ID)
    @IsNotEmpty({ message: 'El ID del usuario es requerido' })
    @IsUUID()
    userId: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString({ message: 'El RFC debe ser una cadena de texto' })
    @Length(13, 13, { message: 'El RFC debe tener 13 caracteres' })
    rfc?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString({ message: 'El NSS debe ser una cadena de texto' })
    @Length(11, 11, { message: 'El NSS debe tener 11 caracteres' })
    nss?: string;

    @Field()
    @IsNotEmpty({ message: 'El tipo de sangre es requerido' })
    @IsString({ message: 'El tipo de sangre debe ser una cadena de texto' })
    @Length(2, 3, { message: 'El tipo de sangre debe tener 3 caracteres' })
    bloodType: string;

    @Field()
    @IsNotEmpty({ message: 'Las alergias son requeridas' })
    @IsString({ message: 'Las alergias deben ser una cadena de texto' })
    allergies: string;

    @Field()
    @IsNotEmpty({ message: 'El nombre del contacto de emergencia es requerido' })
    @IsString({ message: 'El nombre del contacto de emergencia debe ser una cadena de texto' })
    @Length(2, 200, { message: 'El nombre del contacto de emergencia debe tener entre 2 y 200 caracteres' })
    emergencyContactName: string;

    @Field()
    @IsNotEmpty({ message: 'El teléfono del contacto de emergencia es requerido' })
    @IsString({ message: 'El teléfono del contacto de emergencia debe ser una cadena de texto' })
    @Length(10, 10, { message: 'El teléfono del contacto de emergencia debe tener 10 caracteres' })
    emergencyContactPhone: string;

    @Field()
    @IsNotEmpty({ message: 'La relación del contacto de emergencia es requerida' })
    @IsString({ message: 'La relación del contacto de emergencia debe ser una cadena de texto' })
    @Length(2, 50, { message: 'La relación del contacto de emergencia debe tener entre 2 y 50 caracteres' })
    emergencyContactRelationship: string;

    @Field()
    @IsNotEmpty({ message: 'La fecha de nacimiento es requerida' })
    @IsDate({ message: 'La fecha de nacimiento debe ser una fecha válida' })
    birthDate: Date;

    @Field()
    @IsNotEmpty({ message: 'La dirección es requerida' })
    @IsString({ message: 'La dirección debe ser una cadena de texto' })
    @Length(2, 200, { message: 'La dirección debe tener entre 2 y 200 caracteres' })
    address: string;

    @Field()
    @IsNotEmpty({ message: 'La educación es requerida' })
    @IsString({ message: 'La educación debe ser una cadena de texto' })
    @Length(2, 100, { message: 'La educación debe tener entre 2 y 100 caracteres' })
    education: string;

    @Field()
    @IsNotEmpty({ message: 'El número de hijos es requerido' })
    @IsInt({ message: 'El número de hijos debe ser un número entero' })
    @IsPositive({ message: 'El número de hijos debe ser un número positivo' })
    childrenCount: number;

    @Field()
    @IsNotEmpty({ message: 'El tamaño de la camisa es requerido' })
    @IsString({ message: 'El tamaño de la camisa debe ser una cadena de texto' })
    @Length(2, 20, { message: 'El tamaño de la camisa debe tener entre 2 y 20 caracteres' })
    shirtSize: string;

    @Field()
    @IsNotEmpty({ message: 'El tamaño de la pantalón es requerido' })
    @IsString({ message: 'El tamaño de la pantalón debe ser una cadena de texto' })
    @Length(2, 20, { message: 'El tamaño de la pantalón debe tener entre 2 y 20 caracteres' })
    pantsSize: string;

    @Field()
    @IsNotEmpty({ message: 'El tamaño de la zapatilla es requerido' })
    @IsString({ message: 'El tamaño de la zapatilla debe ser una cadena de texto' })
    @Length(2, 20, { message: 'El tamaño de la zapatilla debe tener entre 2 y 20 caracteres' })
    shoeSize: string;

    @Field()
    @IsNotEmpty({ message: 'La ruta de transporte es requerida' })
    @IsString({ message: 'La ruta de transporte debe ser una cadena de texto' })
    @Length(2, 100, { message: 'La ruta de transporte debe tener entre 2 y 100 caracteres' })
    transportRoute: string;

    @Field()
    @IsNotEmpty({ message: 'La fecha de contratación es requerida' })
    @IsDate({ message: 'La fecha de contratación debe ser una fecha válida' })
    hireDate: Date;

    @Field()
    @IsNotEmpty({ message: 'El periodo de vacaciones es requerido' })
    @IsInt({ message: 'El periodo de vacaciones debe ser un número entero' })
    @IsPositive({ message: 'El periodo de vacaciones debe ser un número positivo' })
    vacationPeriod: number;

    @Field()
    @IsNotEmpty({ message: 'El ID de la posición es requerido' })
    @IsUUID()
    positionId: string;
}

@InputType()
export class UpdateTechnicianInput extends PartialType(OmitType(CreateTechnicianInput, ['userId'])) {
    @Field(() => ID)
    @IsNotEmpty({ message: 'El ID del técnico es requerido' })
    @IsUUID()
    id: string;
}