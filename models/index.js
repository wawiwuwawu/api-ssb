const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');

// Import models
const UserAdmin = require('./UserAdmin')(sequelize, DataTypes);
const SSB = require('./SSB')(sequelize, DataTypes);
const Siswa = require('./Siswa')(sequelize, DataTypes);

// UserAdmin has many SSB (One-to-Many)
UserAdmin.hasMany(SSB, {
  foreignKey: 'admin_id',
  as: 'ssbs',
  onDelete: 'CASCADE'
});

SSB.belongsTo(UserAdmin, {
  foreignKey: 'admin_id',
  as: 'admin',
  onDelete: 'CASCADE'
});

// SSB has many Siswa (One-to-Many)
SSB.hasMany(Siswa, {
  foreignKey: 'ssb_id',
  as: 'siswas',
  onDelete: 'CASCADE'
});

Siswa.belongsTo(SSB, {
  foreignKey: 'ssb_id',
  as: 'ssb',
  onDelete: 'CASCADE'
});

// Export models
module.exports = {
  sequelize,
  UserAdmin,
  SSB,
  Siswa,
};
