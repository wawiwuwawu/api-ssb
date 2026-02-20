const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');

// Import models
const UserAdmin = require('./UserAdmin')(sequelize, DataTypes);
const SBB = require('./SBB')(sequelize, DataTypes);
const Siswa = require('./Siswa')(sequelize, DataTypes);

// UserAdmin has many SBB (One-to-Many)
UserAdmin.hasMany(SBB, {
  foreignKey: 'admin_id',
  as: 'sbbs',
  onDelete: 'CASCADE'
});

SBB.belongsTo(UserAdmin, {
  foreignKey: 'admin_id',
  as: 'admin',
  onDelete: 'CASCADE'
});

// SBB has many Siswa (One-to-Many)
SBB.hasMany(Siswa, {
  foreignKey: 'sbb_id',
  as: 'siswas',
  onDelete: 'CASCADE'
});

Siswa.belongsTo(SBB, {
  foreignKey: 'sbb_id',
  as: 'sbb',
  onDelete: 'CASCADE'
});

// Export models
module.exports = {
  sequelize,
  UserAdmin,
  SBB,
  Siswa,
};
