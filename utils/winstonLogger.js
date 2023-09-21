import winston from 'winston';
import winstonDaily from 'winston-daily-rotate-file';
import path from 'path';

const __dirname = path.resolve();
const { combine, timestamp, printf, colorize } = winston.format;

const logsDir = path.join(__dirname, 'logs/' + process.argv[2].split("-")[0]);

// 로그는 WAF에서 로그로 빼는게 좋음. 여기서 기록할 로그는 실패나 에러 발생시 기록용
const logFormat = printf(info => (
  `${info.timestamp} ${info.level} : ${info.message}`
));
// info: {
//   timestamp: '2021-10-08 10:56',
//   level: 'info',
//   message: '::ffff:192.168.29.179 - - [08/Oct/2021:01:56:44 +0000] "GET / HTTP/1.1" 200 3 "-" "Mozilla/5.0 (Linux; Android 9; KFMAWI) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36 EdgA/93.0.961.69"\n',
// }


const defaultOpts = {
  datePattern: 'YYYY-MM-DD',
  maxFiles: 62,
  zippedArchive: true,
}

const logger = winston.createLogger({
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    logFormat
  ),
  transports: [
    new winstonDaily({
      ...defaultOpts,
      level: 'info',
      dirname: logsDir,
      filename: '%DATE%.log',
    }),
    new winstonDaily({
      ...defaultOpts,
      level: 'warn',
      dirname: logsDir + '/warn',
      filename: `%DATE%.warn.log`,
    }),
    new winstonDaily({
      ...defaultOpts,
      level: 'error',
      dirname: logsDir + '/error',
      filename: `%DATE%.error.log`,
    }),
  ]
});

logger.stream = {
  write: message => {
    logger.info(message);
  }
};

if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize({ all: true }),
      logFormat,
    )
  }))
};

export default logger;