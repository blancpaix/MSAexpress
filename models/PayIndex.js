import Sequelize, { DataTypes } from 'sequelize';

import Item from './PayItem.js';
import Purchase from './PayPurchase.js';
import { dbConfig } from '../utils/ConfigManager.js'

export const db = {};
const sequelize = new Sequelize(dbConfig);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.Item = Item(sequelize, DataTypes);
db.Purchase = Purchase(sequelize, DataTypes);

db.Item.hasMany(db.Purchase);
db.Purchase.belongsTo(db.Item);