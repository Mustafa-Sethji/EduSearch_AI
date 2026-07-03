import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Bookmark = sequelize.define('Bookmark', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  bookId: { type: DataTypes.INTEGER, allowNull: false },
  page: { type: DataTypes.INTEGER, allowNull: false },
  snippet: { type: DataTypes.TEXT, defaultValue: '' },
  note: { type: DataTypes.TEXT, defaultValue: '' },
  color: { type: DataTypes.STRING(20), defaultValue: '#6366f1' },
}, {
  tableName: 'bookmarks',
  timestamps: true,
});

export default Bookmark;
