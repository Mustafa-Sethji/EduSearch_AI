import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SearchHistory = sequelize.define('SearchHistory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  bookId: { type: DataTypes.INTEGER, allowNull: false },
  queryText: { type: DataTypes.TEXT, allowNull: false },
  querySource: { type: DataTypes.ENUM('text', 'ocr', 'voice'), defaultValue: 'text' },
  difficulty: { type: DataTypes.STRING(20), defaultValue: null },
  subject: { type: DataTypes.STRING(50), defaultValue: null },
  resultCount: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'search_history',
  timestamps: true,
});

export default SearchHistory;
