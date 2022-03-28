import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

export const LOCAL_ADDRESS = process.env.ADDRESS;

export const dbConfig = {
  database: () => dbSelector(process.argv[2]),
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PW,
};

const dbSelector = (serviceType) => {
  switch (serviceType) {
    case 'auth-service':
      return 'auth_msa';
    case 'pay-service':
      return 'pay_msa';
    case 'etc-service':
      return 'etc_msa';
    default:
      return `etc_msa`;
  }
}