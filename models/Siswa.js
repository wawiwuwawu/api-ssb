module.exports = (sequelize, DataTypes) => {
  const Siswa = sequelize.define(
    "siswa",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, },
      name: { type: DataTypes.STRING(255), allowNull: false,
        validate: {
          notEmpty: { msg: "Nama tidak boleh kosong" },
        },
      },
      age: { 
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: { args: [5], msg: "Umur minimal 5 tahun" },
          max: { args: [25], msg: "Umur maksimal 25 tahun" },
        },
      },
      position: {
        type: DataTypes.ENUM("Kiper", "Bek", "Gelandang", "Penyerang"),
        allowNull: false,
      },
      foto: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "siswa",
      timestamps: false,
    }
  );


  return Siswa;
};
