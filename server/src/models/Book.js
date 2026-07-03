import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Book = sequelize.define('Book', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: false },
  filename: { type: DataTypes.STRING(255), allowNull: false },
  filePath: { type: DataTypes.STRING(500), allowNull: false },
  status: {
    type: DataTypes.ENUM('uploading', 'processing', 'ready', 'failed'),
    defaultValue: 'uploading',
  },
  progress: { type: DataTypes.INTEGER, defaultValue: 0 },
  progressStep: { type: DataTypes.STRING(100), defaultValue: '' },
  totalPages: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalChunks: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalWords: { type: DataTypes.INTEGER, defaultValue: 0 },
  artifactPath: { type: DataTypes.STRING(500), defaultValue: null },
  errorMessage: { type: DataTypes.TEXT, defaultValue: null },
}, {
  tableName: 'books',
  timestamps: true,
});

export default Book;
