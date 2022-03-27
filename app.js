import express from 'express';
import morgan from 'morgan';    // logger
import path from 'path';
import indexRouter from './routers/indexRouter.js';
import authRouter from './routers/authRouter.js';

const PORT = process.argv[2];
const app = express();
const __dirname = path.resolve();
app.use('/images', express.static(path.join(__dirname, 'uploadimg')));

app.use(morgan('dev'));

app.use('/', indexRouter);
app.use('/auth', authRouter);

// 이 방식이 조금 더 깔끔하긴 한듯 ㅎㅎㅎ // 그래도 로직 분리를 위해서는... 라우터로 빼는게 맞는가보다

app.use(function (req, res, next) {
  const err = new Error('404. Not Found');
  err.status = 404;
  // 뭔 차이지?...
  console.log('뭐지..');
  next(err);
});


app.listen(PORT || 5000, () => {
  console.log(`Server on ${PORT || 5000}`);
});


// 서버는 값만 반환해주면 될거같은데??? 그 뒤에서 돌아가는거는 여기서 알아서 하는거고
// 일단 서버에서 로직 처리는 확실히 가능해야 한다는거네?