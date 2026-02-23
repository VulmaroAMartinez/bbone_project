import { Entity, Column, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "src/infrastructure/database/base.entity";
import { User } from "src/modules/users/domain/entities";
import { Position } from "src/modules/catalogs/positions/domain/entities";

@Entity({name: 'technicians'})
export class Technician extends BaseEntity {
    @Column({name: 'user_id', type: 'uuid', unique: true})
    userId: string;

    @OneToOne(() => User)
    @JoinColumn({name: 'user_id'})
    user: User;

    @Column({type: 'varchar', length: 13, nullable: true})
    rfc?: string;

    @Column({type: 'varchar', length: 11, nullable: true})
    nss?: string;

    @Column({ name: 'blood_type', type: 'varchar', length: 5 })
    bloodType: string;

    @Column({ type: 'text'})
    allergies: string;

    @Column({ name: 'emergency_contact_name', type: 'varchar', length: 200 })
    emergencyContactName: string;

    @Column({ name: 'emergency_contact_phone', type: 'varchar', length: 20 })
    emergencyContactPhone: string;

    @Column({ name: 'emergency_contact_relationship', type: 'varchar', length: 50 })
    emergencyContactRelationship: string;

    @Column({ name: 'birth_date', type: 'date' })
    birthDate: Date;

    @Column({ name: 'address', type: 'text' })
    address: string;

    @Column({ type: 'varchar', length: 100})
    education: string;

    @Column({name: 'child_count', type: 'int', default: 0})
    childrenCount: number;

    @Column({name: 'shirt_size', type: 'varchar', length: 20})
    shirtSize: string;

    @Column({name: 'pants_size', type: 'varchar', length: 20})
    pantsSize: string;

    @Column({name: 'shoe_size', type: 'varchar', length: 20})
    shoeSize: string;

    @Column({name:'transport_route', type: 'varchar', length: 100})
    transportRoute: string;

    @Column({name: 'hire_date', type: 'date'})
    hireDate: Date;

    @Column({name: 'vacation_period', type: 'int', default: 0})
    vacationPeriod: number;

    @Column({name:'position_id', type: 'uuid'})
    positionId: string;

    @ManyToOne(() => Position)
    @JoinColumn({name: 'position_id'})
    position: Position;
}