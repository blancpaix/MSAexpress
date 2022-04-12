import { db } from '../models/PayIndex.js';
import { Op } from 'sequelize';

class PayLogic {

  // return [] / [arr]
  async getItems() {
    return await db.Item.findAll({
      attributes: [
        'itemUID',
        'title',
        'price',
        'discription',
        'img',
        'manager',
        'updatedAt'
      ],
      limit: 8,
      where: {
        deletedAt: {
          [Op.is]: null
        }
      }
    });
  }

  // return error / item Data
  async registerItem(title, price, count, img, discription, manager) {
    const result = await db.Item.create({
      title, price, count, img, discription, manager
    }, { field: ['title'] })
    console.log('result?', result);
    return result;
  }
  // return error / item Data
  async findItemById(itemUID) {
    return await db.Item.findOne({
      where: {
        itemUID,
        deletedAt: {
          [Op.is]: null
        },
      }
    })
  }
  async findDeletedItemById(itemUID) {
    return await db.Item.findOne({
      where: {
        itemUID,
        deletedAt: {
          [Op.is]: true
        },
      }
    })
  }

  // Obj.patchValue = {title, price, img ...} , Obj.itemUID = itemUID
  async patchItem(patchObj) {
    return await db.Item.update(patchObj.value,
      { where: { itemUID: patchObj.itemUID } }
    );
  }

  // return 0 / 1
  async deleteItem(itemUID) {
    return await db.Item.destroy({ where: { itemUID } })
  }

  // return Purcahse Obj
  async recordPurchase(count, price, discount, type, userUID, remark, ItemItemUID) {
    return await db.Purchase.create({
      count, price, discount, type, userUID, remark, ItemItemUID
    });
  }

  async getPurchase(idx, userUID) {
    return await db.Purchase.findOne({
      where: { idx, userUID }
    })
  };

  async getPurchases(userUID) {
    return await db.Purchase.findAll({
      where: { userUID }
    })
  };

  async deletePurchase(purchaseUID) {
    return await db.Purchase.destroy({
      where: {
        idx: purchaseUID,
      }
    })
  }


}

export const PayLogics = new PayLogic();




