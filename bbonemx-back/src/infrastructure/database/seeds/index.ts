import { appDataSource as seedDataSource } from '../data-source';
import { seedRoles } from './roles.seed';
import { seedDepartments } from './departments.seed';
import { seedAdmin } from './admin.seed';
import { seedAreas } from './area.seed';
import { seedSubAreas } from './area.seed';

async function runSeeds(): Promise<void> {
  try {
    await seedDataSource.initialize();

    console.log('Running database seeds...');

    await seedRoles(seedDataSource);
    await seedDepartments(seedDataSource);
    await seedAdmin(seedDataSource);
    await seedAreas(seedDataSource);
    await seedSubAreas(seedDataSource);

    console.log('Seeds completed successfully.');
  } catch (error) {
    console.error('Error running seeds:', error);
    process.exit(1);
  } finally {
    if (seedDataSource.isInitialized) {
      await seedDataSource.destroy();
    }
  }
}

void runSeeds();
