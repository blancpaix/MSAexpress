import Sequelize, { DataTypes } from 'sequelize';

import User from './AuthUser.js';
import Point from './AuthPoint.js';
import { dbConfig } from '../utils/ConfigManager.js'

export const db = {};
const sequelize = new Sequelize(dbConfig);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.User = User(sequelize, DataTypes);
db.Points = Point(sequelize, DataTypes);

db.User.hasMany(db.Points);
db.Points.belongsTo(db.User);