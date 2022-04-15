import { Op } from 'sequelize';
import { db } from '../models/FileIndex.js';

class FileLogic {

  async getImages(itemUID) {
    return await db.Image.findAll({
      where: {
        itemUID,
        deletedAt: {
          [Op.is]: null
        }
      }
    })
  }

  async deleteImage(name) {
    return await db.Image.destroy({
      where: { name }
    });
  };

  async deleteImages(filenames) {
    return await db.Image.destroy({
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
    return await db.Image.bulkCreate(uploadData);
  }

  // imgUIDs : [imgUID, ... ],
  // return true / Error
  async updateReference(imgUIDs, itemUID) {
    await db.Image.update({
      itemUID
    }, {
      where: {
        imgUID: [imgUIDs]
      }
    });
    return true;
  }


}



export const FileLogics = new FileLogic();