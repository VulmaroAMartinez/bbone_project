import { DataSource } from 'typeorm';
import { Role } from '../../../modules/catalogs/roles/domain/entities/role.entity';


const INITIAL_ROLES = [
  { name: 'ADMIN' },
  { name: 'TECHNICIAN' },
  { name: 'REQUESTER' },
];

export async function seedRoles(dataSource: DataSource): Promise<void> {
  
  const roleRepository = dataSource.getRepository(Role);
  
  for (const roleData of INITIAL_ROLES) {
    const existingRole = await roleRepository.findOne({
      where: { name: roleData.name },
    });
    
    if (existingRole) {
      continue;
    }
    
    const role = roleRepository.create({
      name: roleData.name,
      isActive: true,
    });
    
    await roleRepository.save(role);
  }
  
}

export async function getRoleByName(
  dataSource: DataSource,
  roleName: string,
): Promise<Role | null> {
  const roleRepository = dataSource.getRepository(Role);
  return roleRepository.findOne({ where: { name: roleName } });
}
