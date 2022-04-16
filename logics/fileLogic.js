import { Op } from 'sequelize';
import { db } from '../models/FileIndex.js';

class FileLogic {

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

  async deleteImage(name) {
    return await db.File.destroy({
      where: { name }
    });
  };

  async deleteImages(filenames) {
    return await db.File.destroy({
      where: {
        name: filenames
      }
    })
  };

  // return image data / Error
  async uploadImage(name) {
    return await db.Image.create({ name });
  };

  // return images data / Error
  async uploadImages(names) {
    const uploadData = names.map(data => ({ name: data.filename }));
    return await db.File.bulkCreate(uploadData);
  }

  // imgUIDs : [imgUID, ... ],
  // return true / Error
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

}


export const FileLogics = new FileLogic();