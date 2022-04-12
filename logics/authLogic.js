import { db } from '../models/AuthIndex.js';

class AuthLogic {

  // User data / null
  async findUserByEmail(email) {
    return await db.User.findOne({ where: { email } });
  }

  // User data / null
  async findUserByPhone(phonenum) {
    return await db.User.findOne({ where: { phonenum } });
  }
  // User data / null
  async findUserByUID(userUID) {
    return await db.User.findOne({ where: { userUID } });
  };

  // 0 / 1
  async dropout(userUID) {
    return await db.User.destroy({
      where: { userUID }
    });
  };

  // error / User data
  async createUser(email, pwHash, displayname, phonenum) {
    return await db.User.create({
      email,
      password: pwHash,
      displayname,
      phonenum,
    });
  };

  // error / User.point
  async createLoadRecord(type, remark, load, UserUserUID) {
    try {
      const result = await db.sequelize.transaction(async transaction => {
        await db.Points.create({
          type, remark, load, UserUserUID
        }, { transaction });
        await db.User.increment({
          point: load
        }, {
          where: { userUID: UserUserUID },
          transaction
        });
        return await db.User.findOne({
          where: { userUID: UserUserUID },
          transaction
        })
      });

      return result.point;
    } catch (err) {
      console.error('Error! /auth/createLoadRecored', err);
      return err;
    }
  }

  // error / Point data
  async createPurchaseRecord(type, remark, pay, purchaseUID, userUID) {
    try {
      const userData = await db.User.findOne({ where: { userUID } });
      if (!userData || userData.point < pay) return new Error('포인트가 부족합니다.');

      await db.sequelize.transaction(async transaction => {
        await db.Points.create({
          type,
          remark,
          pay,
          purchaseUID,
          UserUserUID: userUID,
        }, {
          transaction
        });
        await db.User.decrement({
          point: pay
        }, {
          where: { userUID },
          transaction
        });
      });

      return { result: true, currentPoint: userData.point - pay }
    } catch (err) {
      console.error('ERROR! /auth/createPurchaseRecord', err, err.message);
      return { result: false, Error: err.message };
    }
  }
}

export const AuthLogics = new AuthLogic();

