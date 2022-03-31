import Sequelize, { DataTypes } from 'sequelize';

import User from './AuthUser.js';
import Point from './AuthPoint.js';
import { dbConfig } from '../utils/ConfigManager.js'

export const db = {};
const sequelize = new Sequelize(dbConfig);

const UserModel = User(sequelize, DataTypes);
const PointModel = Point(sequelize, DataTypes);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.User = UserModel;
db.Points = PointModel;
db.User.hasMany(db.Points);
db.Points.belongsTo(db.User);