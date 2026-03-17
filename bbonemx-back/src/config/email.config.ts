import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  enabled: process.env.EMAIL_ENABLE !== 'false',
  defaultFrom: {
    name: process.env.EMAIL_DEFAULT_FROM_NAME ?? 'Bumble bee Maintenance',
    address: process.env.EMAIL_FROM_ADDRESS ?? 'no-reply@bumblebeefoods.com',
  },
  transport: {
    host: process.env.EMAIL_HOST ?? 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT ?? '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
}));
