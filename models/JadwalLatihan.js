module.exports = (sequelize, DataTypes) => {
  const JadwalLatihan = sequelize.define(
    "jadwal_latihan",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      day: { 
        type: DataTypes.ENUM("Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"),
        allowNull: false,
        validate: { notEmpty: { msg: "Hari tidak boleh kosong" }}
      },
      time_start: { 
        type: DataTypes.TIME, 
        allowNull: false,
        validate: { notEmpty: { msg: "Waktu mulai tidak boleh kosong" }}
      },
      time_end: { type: DataTypes.TIME, allowNull: false,
        validate: { notEmpty: { msg: "Waktu selesai tidak boleh kosong" }}
      },
      age_grouping: {
        type: DataTypes.ENUM("U-10", "U-12", "U-15", "U-17", "U-20", "Senior"),
        allowNull: false,
        validate: { notEmpty: { msg: "Kelompok umur tidak boleh kosong" }}
      },
      ssb_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "SSB", key: "id" },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      }
    },
    {
      tableName: "jadwal_latihan",
      timestamps: false
    }
  );

  return JadwalLatihan;
};
