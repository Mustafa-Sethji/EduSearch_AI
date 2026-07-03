import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Chunk = sequelize.define('Chunk', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  bookId: { type: DataTypes.INTEGER, allowNull: false },
  page: { type: DataTypes.INTEGER, allowNull: false },
  text: { type: DataTypes.TEXT, allowNull: false },
  cleanText: { type: DataTypes.TEXT, allowNull: false },
  wordCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  charCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  cluster: { type: DataTypes.INTEGER, defaultValue: 0 },
  difficulty: { type: DataTypes.STRING(20), defaultValue: 'Medium' },
  subject: { type: DataTypes.STRING(50), defaultValue: 'General' },
}, {
  tableName: 'chunks',
  timestamps: false,
  indexes: [{ fields: ['bookId'] }, { fields: ['page'] }],
});

export default Chunk;
