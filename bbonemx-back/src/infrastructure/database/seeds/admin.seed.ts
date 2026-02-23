import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../../modules/users/domain/entities/user.entity';
import { getRoleByName } from './roles.seed';
import { getDepartmentByName } from './departments.seed';


const ADMIN_USER = {
  employeeNumber: 'ADMIN001',
  password: 'Admin123!',
  firstName: 'Administrador',
  lastName: 'Sistema',
  email: 'admin@bbonemx.com',
  phone: null,
};

export async function seedAdmin(dataSource: DataSource): Promise<void> {

  const userRepository = dataSource.getRepository(User);

  const existingAdmin = await userRepository.findOne({
    where: { employeeNumber: ADMIN_USER.employeeNumber },
  });

  if (existingAdmin) {
    return;
  }

  const adminRole = await getRoleByName(dataSource, 'ADMIN');

  if (!adminRole) {
    throw new Error('El rol ADMIN no existe');
  }

  const maintenanceDepartment = await getDepartmentByName(dataSource, 'MAINTENANCE');

  if (!maintenanceDepartment) {
    throw new Error('El departamento MAINTENANCE no existe');
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(ADMIN_USER.password, saltRounds);

  const admin = userRepository.create({
    employeeNumber: ADMIN_USER.employeeNumber,
    password: hashedPassword,
    firstName: ADMIN_USER.firstName,
    lastName: ADMIN_USER.lastName,
    email: ADMIN_USER.email,
    roleId: adminRole.id,
    departmentId: maintenanceDepartment.id,
    isActive: true,
  });

  await userRepository.save(admin);

}
