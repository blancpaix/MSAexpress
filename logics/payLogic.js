import { db } from '../models/PayIndex.js';
import { Op } from 'sequelize';

class PayLogic {

  async searchItems(term, page, limit) {
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
      where: {
        title: {
          [Op.like]: `%${term}%`,
        },
        deletedAt: {
          [Op.is]: null
        }
      },
      order: [
        ['itemUID', 'DESC'],
      ],
      offset: limit * (page - 1),
      limit,
    })
  }

  // RETURN: [item, ...] / [arr]
  async getItems(page, limit) {
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
      where: {
        deletedAt: {
          [Op.is]: null
        }
      },
      order: [
        ['itemUID', 'DESC'],
      ],
      offset: limit * (page - 1),
      limit,
    });
  }

  // RETURN: Item data / Error
  async registerItem(title, price, count, img, discription, manager) {
    const result = await db.Item.create({
      title, price, count, img, discription, manager
    }, { field: ['title'] })
    return result;
  }
  // RETURN: Item data / Error
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

  // RETURN: Item data / Error
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

  // RETURN: true / Error
  // Obj.patchValue = {title, price, img ...} , Obj.itemUID = itemUID
  async patchItem(patchObj) {
    await db.Item.update(patchObj.value,
      { where: { itemUID: patchObj.itemUID } }
    );
    return true;
  }

  // RETURN: 0 / 1
  async deleteItem(itemUID) {
    return await db.Item.destroy({ where: { itemUID } })
  }

  // RETURN: 0 / 1
  async deleteItemForce(itemUID) {
    return await db.Item.destroy({ where: { itemUID }, force: true })
  }

  // RETURN: Purcahse data / Error
  async recordPurchase(count, price, discount, type, userUID, remark, ItemItemUID) {
    return await db.Purchase.create({
      count, price, discount, type, userUID, remark, ItemItemUID
    });
  }

  // RETURN: Purchase data / Error
  async getPurchase(idx, userUID) {
    return await db.Purchase.findOne({
      attributes: [
        'idx',
        'count',
        'price',
        'discount',
        'type',
        'remark',
        'createdAt',
        'ItemItemUID',
      ],
      where: { idx, userUID }
    })
  };

  // RETURN: Purchase datas / Error
  async getPurchases(userUID, page, limit) {
    return await db.Purchase.findAll({
      attributes: [
        'idx',
        'count',
        'price',
        'discount',
        'type',
        'remark',
        'createdAt',
        'ItemItemUID',
      ],
      where: { userUID },
      order: [
        ['idx', 'DESC'],
      ],
      offset: limit * (page - 1),
      limit,
    })
  };

  // RETURN: 0 / 1
  async deletePurchase(purchaseUID) {
    return await db.Purchase.destroy({
      where: {
        idx: purchaseUID,
      }
    })
  };

}

export const PayLogics = new PayLogic();




