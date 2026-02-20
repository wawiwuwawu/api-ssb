module.exports = (sequelize, DataTypes) => {
    const MovieSiswa = sequelize.define(
      "SiswaSbb",
      {
        sbb_id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: "SBB", key: "id" } },
        siswa_id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: "siswa", key: "id" } },
      },
      {
        tableName: "siswa_sbb",
        timestamps: false
      }
    );
  
  
    return MovieSiswa;
  };
  