import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const dbSelector = () => {
  switch (process.argv[2]) {
    case 'auth-service':
      return process.env.DB_AUTH;
    case 'pay-service':
      return process.env.DB_PAY;
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
  // ttl 은 나중에 꼭 추가합시다
  ttl: 10   // in seconds
};

export const sessionConfig = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET,
  cookie: {
    maxAge: 1000 * 120,
    httpOnly: true,
    secure: false,     // ssl 적용 후  true 전환
  },
};

