import { seedDataSource } from './data-source';
import { seedRoles } from './roles.seed';
import { seedDepartments } from './departments.seed';
import { seedAdmin } from './admin.seed';
import { seedAreas } from './area.seed';
import { seedSubAreas } from './area.seed';


async function runSeeds(): Promise<void> {
  try {
    await seedDataSource.initialize();

    //await seedRoles(seedDataSource);
    //await seedDepartments(seedDataSource);
    //await seedAdmin(seedDataSource);
    await seedAreas(seedDataSource);
    await seedSubAreas(seedDataSource);
    
  } catch (error) {
    process.exit(1);
  } finally {
    if (seedDataSource.isInitialized) {
      await seedDataSource.destroy();
    }
  }
}

runSeeds();
