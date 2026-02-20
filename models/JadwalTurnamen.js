module.exports = (sequelize, DataTypes) => {
  const JadwalTurnamen = sequelize.define(
    "jadwal_turnamen",
    {
      id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
      },
      nama_turnamen: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { 
          notEmpty: { msg: "Nama turnamen tidak boleh kosong" }
        }
      },
      tanggal: { 
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: { 
          notEmpty: { msg: "Tanggal tidak boleh kosong" },
          isDate: { msg: "Format tanggal tidak valid (YYYY-MM-DD)" }
        }
      },
      time_start: { 
        type: DataTypes.TIME, 
        allowNull: false,
        validate: { 
          notEmpty: { msg: "Waktu mulai tidak boleh kosong" }
        }
      },
      time_end: { 
        type: DataTypes.TIME, 
        allowNull: false,
        validate: { 
          notEmpty: { msg: "Waktu selesai tidak boleh kosong" }
        }
      },
      age_grouping: {
        type: DataTypes.ENUM("U-10", "U-12", "U-15", "U-17", "U-20", "Senior"),
        allowNull: false,
        validate: { 
          notEmpty: { msg: "Kelompok umur tidak boleh kosong" }
        }
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: true,
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
      tableName: "jadwal_turnamen",
      timestamps: false
    }
  );

  return JadwalTurnamen;
};