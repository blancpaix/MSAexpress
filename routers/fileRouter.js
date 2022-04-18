import express from 'express';
import asyncHandler from 'express-async-handler';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { isActivate, isOwnFile, isManager } from './middlewares/sessionChecker.js';
import { FileLogics } from '../logics/fileLogic.js';


const router = express.Router();
const __dirname = path.resolve();

// form 형식 multipart/form-data 설정 필요 (front)
fs.readdir(path.join(__dirname, '/images'), (err) => {
  if (err) {
    console.error('images 폴더가 존재하지 않아 생성합니다.');
    fs.mkdirSync('images')
  }
});
fs.readdir(path.join(__dirname, '/statics'), (err) => {
  if (err) {
    console.error('statics 폴더가 존재하지 않아 생성합니다.');
    fs.mkdirSync('statics')
  }
});

const multerOpts = {
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '/images'));
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

// 반환된 이미지 파일 명은 Domain:port/img/:filename으로 접근

router.get('/img/:itemUID', isActivate, asyncHandler(async (req, res) => {
  const result = await FileLogics.getImages(req.params.itemUID);

  res.status(200).send(result);
}));

router.delete('/img/:filename', isOwnFile, asyncHandler(async (req, res) => {
  const result = await FileLogics.deleteImage(req.params.filename);

  res.status(200).send(result);
}));

router.post('/img', isActivate, imgUpload, asyncHandler(async (req, res) => {
  const img = await FileLogics.uploadImage(req.file.filename);

  res.status(200).json({ img });
}));

router.post('/imgs', isActivate, imgsUpload, asyncHandler(async (req, res) => {
  // imgUID, name, null(itemUID)
  const imgs = await FileLogics.uploadImages(req.files);

  res.status(200).send({ imgs })
}));


router.delete('/admin/garbage', isManager, asyncHandler(async (req, res) => {
  const result = await FileLogics.removeDeletedImages();

  res.status(200).send(result);
}));

// delete single image
router.delete('/admin/:filename', isManager, asyncHandler(async (req, res) => {
  const result = await FileLogics.deleteImage(req.params.filename);

  res.status(200).send(result);
}));

// delete multiple images
router.delete('/admin', isManager, asyncHandler(async (req, res) => {
  // filenames : [filename, filename, ...]
  const { filenames } = req.body;
  const result = await FileLogics.deleteImages(filenames);

  res.status(200).send(result);
}));


export default router;