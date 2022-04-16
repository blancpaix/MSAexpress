import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
const __dirname = path.resolve();
dotenv.config({ path: path.join(__dirname, '/.env') });

export const sslOptions = process.env.NODE_ENV === "production"
  ? {
    key: fs.readFileSync('./ssl/server-key.pem'),
    cert: fs.readFileSync('./ssl/server-cert.pem'),
    ca: [fs.readFileSync('./ssl/client-cert.pem')],
  } : null;

const dbSelector = () => {
  switch (process.argv[2]) {
    case 'auth-service':
      return process.env.DB_AUTH;
    case 'pay-service':
      return process.env.DB_PAY;
    case 'file-service':
      return process.env.DB_FILE;
    case 'etc-service':
      return process.env.DB_ETC;
    default:
      return process.env.DB_ETC;
  }
};

export const dbConfig = {
  database: dbSelector(),
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: process.env.DB_DIALECT,
  username: process.env.DB_USER,
  password: process.env.DB_PW,
};


export const redisConfig = {
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  db: 0,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 1,
  ttl: 10   // in seconds
};

export const sessionConfig = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET,
  cookie: {
    maxAge: 1000 * 600,
    httpOnly: true,
    secure: false,     // ssl 적용 후  true 전환
  },
};

export const mailerConfig = {
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.MAILER_ADDRESS,
    pass: process.env.MAILER_PASSWORD,
  }
};