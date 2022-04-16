import Sequelize, { DataTypes } from 'sequelize';

import File from './FileImage.js';
import { dbConfig } from '../utils/ConfigManager.js'

export const db = {};
const sequelize = new Sequelize(dbConfig);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.File = File(sequelize, DataTypes);
