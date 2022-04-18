import { Op } from 'sequelize';
import { db } from '../models/FileIndex.js';
import fs from 'fs';

import path from 'path';
const __dirname = path.resolve();
const imagePath = path.join(__dirname, '/images');


class FileLogic {

  // RETURN: files / Error
  async getImages(itemUID) {
    return await db.File.findAll({
      where: {
        itemUID,
        deletedAt: {
          [Op.is]: null
        }
      }
    })
  }

  // RETURN: true / Error
  async deleteImage(name) {
    await db.File.destroy({
      where: { name }
    });
    return true;
  };

  // RETURN: true / Error
  async deleteImages(filenames) {
    await db.File.destroy({
      where: {
        name: filenames
      }
    });
    return true;
  };

  // RETURN: uploaded image data / Error
  async uploadImage(name) {
    return await db.Image.create({ name });
  };

  // RETURN: uploaded images data / Error
  async uploadImages(names) {
    const uploadData = names.map(data => ({ name: data.filename }));
    return await db.File.bulkCreate(uploadData);
  }

  // RETURN: { result : true } / { result : false, Error,}
  // imgUIDs : [ imgUID, ... ],
  async updateReference(itemUID, img) {
    try {
      await db.File.update({
        itemUID
      }, {
        where: {
          name: [img]
        }
      });
      return { result: true }
    } catch (err) {
      console.error('Error! update Reference', err, err.message);
      return { result: false, Error: err.message };
    }
  }

  // RETURN: true / Error
  async removeDeletedImages() {
    const deletedUIDS = [];
    try {
      const result = await db.File.findAll({
        where: {
          deletedAt: {
            [Op.ne]: null,
          }
        },
        paranoid: false,
        attributes: ['imageUID', 'name']
      });
      // deletedAt 과 같이 options 으로 생성된 columns 는 paranoid 옵션을 적용해서 검색해야 결과 도출됨

      const promises = result.map(deletedImage => {
        console.log(deletedImage.name, deletedImage.imageUID);
        const deletedImagePath = path.join(imagePath, deletedImage.name);
        if (fs.existsSync(deletedImagePath)) {
          fs.unlinkSync(deletedImagePath);
          deletedUIDS.push(deletedImage.imageUID);
        }
      });
      await Promise.all(promises);

      if (deletedUIDS.length !== 0) {
        await db.File.destroy({
          where: {
            imageUID: deletedUIDS
          },
          force: true
        })
      };

      return true;
    } catch (err) {
      console.error('Error! remove Deleted Images', err);
      return err;
    }
  }

}


export const FileLogics = new FileLogic();