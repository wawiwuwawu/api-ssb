const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');

// Import models
const UserAdmin = require('./UserAdmin')(sequelize, DataTypes);
const SSB = require('./SSB')(sequelize, DataTypes);
const Siswa = require('./Siswa')(sequelize, DataTypes);
const JadwalLatihan = require('./JadwalLatihan')(sequelize, DataTypes);
const JadwalTurnamen = require('./JadwalTurnamen')(sequelize, DataTypes);

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

// SSB has many JadwalLatihan (One-to-Many)
SSB.hasMany(JadwalLatihan, {
  foreignKey: 'ssb_id',
  as: 'jadwal_latihan',
  onDelete: 'CASCADE'
});

JadwalLatihan.belongsTo(SSB, {
  foreignKey: 'ssb_id',
  as: 'ssb',
  onDelete: 'CASCADE'
});

// SSB has many JadwalTurnamen (One-to-Many)
SSB.hasMany(JadwalTurnamen, {
  foreignKey: 'ssb_id',
  as: 'jadwal_turnamen',
  onDelete: 'CASCADE'
});

JadwalTurnamen.belongsTo(SSB, {
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
  JadwalLatihan,
  JadwalTurnamen,
  UserAdmin
};
