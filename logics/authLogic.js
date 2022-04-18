import nodemailer from 'nodemailer';
import { Op } from 'sequelize';

import { db } from '../models/AuthIndex.js';
import { mailerConfig } from '../utils/ConfigManager.js';

class AuthLogic {

  // RETURN: User data / null
  async findUserByEmail(email) {
    return await db.User.findOne({
      attributes: [
        'email',
        'phonenum',
      ],
      where: {
        email,
        deletedAt: {
          [Op.is]: null
        },
      }
    });
  }

  // RETURN: User data / null
  async findUserByPhone(phonenum) {
    return await db.User.findOne({
      attributes: [
        'userUID',
        'password',
        'email',
        'phonenum',
      ],
      where: {
        phonenum,
        deletedAt: {
          [Op.is]: null
        },
      }
    });
  };

  // RETURN: User data / null       이거 안보이는데...
  async findUserByUID(userUID) {
    return await db.User.findOne({
      where: {
        userUID,
        deletedAt: {
          [Op.is]: null
        },
      }
    });
  };

  // RETURN: 0 / 1
  async dropout(userUID) {
    return await db.User.destroy({
      where: { userUID }
    });
  };

  // RETURN: User data / Error
  async createUser(email, pwHash, displayname, phonenum) {
    return await db.User.create({
      email,
      password: pwHash,
      displayname,
      phonenum,
    });
  };

  // Point 충전, RETURN: User.point / Error
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
          attributes: [
            'point'
          ],
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

  // RETURN: Point data / Error
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
  };

  // RETURN: true / Error
  async updatePassword(email, password) {
    await db.User.update({ password }, {
      where: {
        email,
        deletedAt: {
          [Op.is]: null
        },
      }
    })

    return true;
  }

  // RETURN: true / Error
  // mailer는 서버 분리가 더 좋아보임...
  async sendPasswordMail(target, password) {
    try {
      const transporter = nodemailer.createTransport(mailerConfig);
      await transporter.sendMail({
        from: mailerConfig.auth.user,
        to: target,
        subject: 'MSA Express 비밀번호 설정입니다.',
        text: `비밀번호는 ${password} 입니다. \n로그인 후 변경해주세요.`
      });

      return true;
    } catch (err) {
      console.error(`Error! send Password Mail `, err);
      return err;
    }
  }

}

export const AuthLogics = new AuthLogic();

