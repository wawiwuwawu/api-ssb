module.exports = (sequelize, DataTypes) => {
  const AdminSbbList = sequelize.define(
    "AdminSbbList",
    {
      user_id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: "user_admin", key: "id" }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      sbb_id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: "SBB", key: "id" }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
    },
    {
      tableName: "admin_sbb_list",
      timestamps: false
    }
  );



  return AdminSbbList;
}