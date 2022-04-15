import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { isActivate, isAdmin } from './middlewares/sessionChecker.js';

const router = express.Router();
const __dirname = path.resolve();

// form 형식 multipart/form-data 설정 필요 (front)
fs.readdir(path.join(__dirname, '/images'), (err) => {
  if (err) {
    console.error('images 폴더가 존재하지 않아 생성합니다.');
    fs.mkdirSync('images')
  }
});
fs.readdir(path.join(__dirname, '/static'), (err) => {
  if (err) {
    console.error('static 폴더가 존재하지 않아 생성합니다.');
    fs.mkdirSync('static')
  }
});

const multerOpts = {
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, '../images');
    },
    filename: (req, file, cb) => {
      const email = req.session.passport.user.email;
      const ext = path.extname(file.originalname);
      cb(null, path.basename(email + "_" + Date.now() + ext));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/webp") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('jpg, .jpeg, png, .webp 확장자만 등록할 수 있습니다.'));
    }
  }
};

const imgUpload = multer(multerOpts).single('img');
const imgsUpload = multer(multerOpts).array('img');

// 반환된 이미지 파일 명은 fileServierDomain:port/img/filename 으로 접근
// db 저장된 이미지파일은 split("|")로 나눈 후 앞에 등록한 사람의 email 주소를 붙이면 불러올 수 있음
// item upload 하는 사람은 고유하기때문에 다른 사람이 어떻게 할 수가 없지 ㅎㅎㅎ

router.post('/img', isActivate, imgUpload, (req, res) => {
  res.json({ url: `/img/${req.file.filename}` });
});

router.post('/imgs', isActivate, imgsUpload, (req, res) => {
  const images = [];
  let dbImg = '';
  req.files.map((data, index) => {
    images[index] = data.filename;
    const timeExt = data.filename.split("_");
    if (index === 0) {
      dbImg += timeExt[timeExt.length - 1];
    } else {
      dbImg += "|" + timeExt[timeExt.length - 1];
    }
  });
  res.json({ uploadText: dbImg, images });
});

router.delete('/:imgid', isAdmin, (req, res, next) => {
  // role??
  console.log('req.param', req.params.imgid);
  res.send('test');
})


export default router;