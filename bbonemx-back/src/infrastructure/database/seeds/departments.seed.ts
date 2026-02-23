import { DataSource } from 'typeorm';
import { Department } from '../../../modules/catalogs/departments/domain/entities/department.entity';


const INITIAL_DEPARTMENTS = [
  { name: 'TI', description: 'Tecnologías de la Información' },
  { name: 'MAINTENANCE', description: 'Mantenimiento' },
];

export async function seedDepartments(dataSource: DataSource): Promise<void> {

  const departmentRepository = dataSource.getRepository(Department);

  for (const departmentData of INITIAL_DEPARTMENTS) {
    const existingDepartment = await departmentRepository.findOne({
      where: { name: departmentData.name },
    });

    if (existingDepartment) {
      continue;
    }

    const department = departmentRepository.create({
      name: departmentData.name,
      description: departmentData.description,
      isActive: true,
    });

    await departmentRepository.save(department);
  }

}

export async function getDepartmentByName(
  dataSource: DataSource,
  departmentName: string,
): Promise<Department | null> {
  const departmentRepository = dataSource.getRepository(Department);
  return departmentRepository.findOne({ where: { name: departmentName } });
}
