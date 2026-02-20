module.exports = (sequelize, DataTypes) => {
  const SBB = sequelize.define(
    "SBB",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, },
      name: { type: DataTypes.STRING, allowNull: false, 
        validate: {
          notEmpty: { msg: "Nama tidak boleh kosong" },
        }, },
      admin_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: { model: "user_admin", key: "id" },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "SBB",
      timestamps: false
    }
  );


  return SBB;
};
