import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ModelMetric = sequelize.define('ModelMetric', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  bookId: { type: DataTypes.INTEGER, allowNull: false },
  modelName: { type: DataTypes.STRING(100), allowNull: false },
  task: { type: DataTypes.ENUM('difficulty', 'subject'), allowNull: false },
  accuracy: { type: DataTypes.FLOAT, defaultValue: 0 },
  f1Score: { type: DataTypes.FLOAT, defaultValue: 0 },
}, {
  tableName: 'model_metrics',
  timestamps: false,
});

export default ModelMetric;
