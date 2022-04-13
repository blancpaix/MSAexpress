import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { isActivate } from './middlewares/sessionChecker.js';

// form 형식 multipart/form-data 설정 필요 (front)

const router = express.Router();
fs.readdir('../images', (err) => {
  if (err) {
    console.error('./images 폴더가 존재하지 않아 생성합니다.');
    fs.mkdirSync('images')
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
    fileSize: 4 * 1024 * 1024,
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
}
const imgUpload = multer(multerOpts).single('img');
const imgsUpload = multer(multerOpts).array('img');

router.post('/img', isActivate, imgUpload, (req, res) => {
  // console.log('업로드 완료된거지??', req.file);
  res.json({ url: `/img/${req.file.filename}` });
});

router.post('/imgs', isActivate, imgsUpload, (req, res) => {
  // console.log('업로드 확인??', req.files);
  const arr = [];
  req.files.map((data, index) => {
    arr[index] = data.filename;
  });

  res.json(arr);
});


export default router;