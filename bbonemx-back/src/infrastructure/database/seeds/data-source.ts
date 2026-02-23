import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const seedDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'bbonemx_db',
  entities: ['src/**/*.entity.ts'],
  synchronize: false,
  logging: true,
});
