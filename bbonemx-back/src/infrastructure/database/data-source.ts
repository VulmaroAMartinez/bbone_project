import { config as loadEnv } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';

loadEnv();

const runtimeDir = __filename.endsWith('.ts') ? 'src' : 'dist';
const runtimeExt = __filename.endsWith('.ts') ? 'ts' : 'js';

export const appDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'bbonemx_db',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  entities: [join(process.cwd(), `${runtimeDir}/**/*.entity.${runtimeExt}`)],
  migrations: [
    join(
      process.cwd(),
      `${runtimeDir}/infrastructure/database/migrations/*.${runtimeExt}`,
    ),
  ],
  migrationsTableName: 'migrations',
});
