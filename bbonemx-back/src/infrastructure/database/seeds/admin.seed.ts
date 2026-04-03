import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../../modules/users/domain/entities/user.entity';
import { UserRole } from '../../../modules/users/domain/entities/user-role.entity';
import { getRoleByName } from './roles.seed';
import { getDepartmentByName } from './departments.seed';

const ADMIN_USER = {
  employeeNumber: '00001',
  firstName: 'Administrador',
  lastName: 'Sistema',
  email: 'admin@bbonemx.com',
  phone: null,
};

export async function seedAdmin(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);
  const userRoleRepository = dataSource.getRepository(UserRole);

  const adminRole = await getRoleByName(dataSource, 'ADMIN');
  if (!adminRole) {
    throw new Error('El rol ADMIN no existe');
  }

  const existingAdmin = await userRepository.findOne({
    where: { employeeNumber: ADMIN_USER.employeeNumber },
    relations: ['userRoles', 'userRoles.role'],
  });

  if (existingAdmin) {
    // Ensure the admin has an active ADMIN role in user_roles.
    // This handles cases where the user was created before the user_roles
    // intermediate table was introduced, or the record is missing/inactive.
    const hasActiveAdminRole = existingAdmin.userRoles?.some(
      (ur) => ur.roleId === adminRole.id && ur.isActive,
    );

    if (!hasActiveAdminRole) {
      const existing = await userRoleRepository.findOne({
        where: { userId: existingAdmin.id, roleId: adminRole.id },
        withDeleted: true,
      });

      if (existing) {
        existing.isActive = true;
        existing.deletedAt = null;
        await userRoleRepository.save(existing);
      } else {
        const ur = userRoleRepository.create();
        ur.userId = existingAdmin.id;
        ur.roleId = adminRole.id;
        ur.isActive = true;
        await userRoleRepository.save(ur);
      }
    }
    return;
  }

  const maintenanceDepartment = await getDepartmentByName(
    dataSource,
    'Mantenimiento',
  );

  if (!maintenanceDepartment) {
    throw new Error('El departamento de mantenimiento no existe');
  }

  const seedPassword =
    process.env.ADMIN_SEED_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD;

  if (!seedPassword) {
    throw new Error('Contraseña requerida para crear administrador');
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(seedPassword, saltRounds);

  const admin = userRepository.create({
    employeeNumber: ADMIN_USER.employeeNumber,
    password: hashedPassword,
    firstName: ADMIN_USER.firstName,
    lastName: ADMIN_USER.lastName,
    email: ADMIN_USER.email,
    departmentId: maintenanceDepartment.id,
    isActive: true,
  });

  const savedAdmin = await userRepository.save(admin);

  const ur = userRoleRepository.create();
  ur.userId = savedAdmin.id;
  ur.roleId = adminRole.id;
  ur.isActive = true;
  await userRoleRepository.save(ur);
}
