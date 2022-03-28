import mysql from 'mysql2';
import { dbConfig } from './CONSTANTS.js';

// const defaultOptions = {
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// }

const connection = mysql.createConnection(dbConfig);

connection.connect(err => {
  if (err) {
    console.log('error Connecting : ' + err.stack);
  };

  console.log('DB Connected as id : ' + connection.threadId);
})


global.dbPool = dbPool;


const dbSelector = (serviceType) => {
  switch (serviceType) {
    case 'auth-service':
      return '';
    case 'pay-service':
      return 'pay-msa';
    case 'etc-service':
      return 'etc-msa';
    default:
      return `etc-msa`;
  }
}


/*
  쉽게 싱글톤 패턴을 구현하는 방법임 (이미 생성되어있는 객체를 export 함)
     global 사용 시 더 명확하게, 종속성에 상관없이 1개만을 유지
    
  global.dbPool = new Database(dbName )
  export const dbInstance = new Database('Settings are in here!');
    이게 싱글톤의 방법인데 안에 변수갑을 외부에서 받아와야 함...그게 큰일인데
  process.env. 이걸로하면 dynamic 하게 들어갈수가 없음

  
  singleton with variables 이거는 좀 어려운거 같음.. 그래서 외부에서 이미 정해져 잇는 값을 가져와서 사용할거임

  auth / pay / chat /... 등등 기본 TABLE 초기화 필요 (switch 써야 할듯...)
*/