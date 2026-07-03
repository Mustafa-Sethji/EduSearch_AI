import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  avatar: { type: DataTypes.STRING(255), defaultValue: null },
  studyStreak: { type: DataTypes.INTEGER, defaultValue: 0 },
  lastActive: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  role: { type: DataTypes.ENUM('student', 'admin'), defaultValue: 'student' },
}, {
  tableName: 'users',
  timestamps: true,
});

export default User;
