import { DataSource } from 'typeorm';

import * as CourseEntities from './course';
import * as PartnerEntities from './partner';
import * as CouponEntities from './coupon';

const entities = [
  ...Object.values(CourseEntities),
  ...Object.values(PartnerEntities),
  ...Object.values(CouponEntities),
];

const dataSourceOptions = {
  type: process.env.DATABASE_TYPE as any,
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities,
  synchronize: true,
  logging: false,
  ...(process.env.NODE_ENV === 'production' && {
    ssl: {
      ca: process.env.DATABASE_SSL_CERTIFICATE,
    },
  }),
};

// Module-level singleton – avoids multiple DataSource instances in hot-reload
let dataSource: DataSource | null = null;

export default async function getConnection(): Promise<DataSource> {
  if (dataSource?.isInitialized) {
    return dataSource;
  }

  dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();
  return dataSource;
}
