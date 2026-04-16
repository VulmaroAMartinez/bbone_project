import { Field, ID, ObjectType } from '@nestjs/graphql';
import { RoleType } from 'src/modules/catalogs/roles/presentation/types';
import { DepartmentType } from 'src/modules/catalogs/departments/presentation/types';

@ObjectType('User')
export class UserType {
  @Field(() => ID)
  id: string;

  @Field()
  employeeNumber: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field(() => ID, {
    nullable: true,
    description: 'ID del rol primario (primer rol)',
  })
  roleId?: string;

  @Field(() => RoleType, {
    nullable: true,
    description: 'Rol primario (primer rol)',
  })
  role?: RoleType;

  @Field(() => [String])
  get roleIds(): string[] {
    return this.roles?.map((role) => role.id) ?? [];
  }

  @Field(() => [RoleType])
  roles: RoleType[];

  @Field(() => ID)
  departmentId: string;

  @Field(() => DepartmentType)
  department: DepartmentType;

  @Field(() => ID, { nullable: true })
  areaId?: string;

  @Field(() => ID, { nullable: true })
  subAreaId?: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => String)
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /*
    @Field(() => Boolean)
    isAdmin(): boolean {
        return this.role === Role.ADMIN;
    }

    @Field(() => Boolean)
    isTechnician(): boolean {
        return this.role === Role.TECHNICIAN;
    }

    @Field(() => Boolean)
    isRequester(): boolean {
        return this.role === Role.REQUESTER;
    }
*/
}
