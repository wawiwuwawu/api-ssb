// models/User.js
const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "UserAdmin",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Nama tidak boleh kosong" },
        },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: {
          name: "email",
          msg: "Email sudah terdaftar",
        },
        validate: {
          isEmail: { msg: "Format email tidak valid" },
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Password tidak boleh kosong" },
          len: {
            args: [6, 255],
            msg: "Password minimal 6 karakter",
          },
        },
      },
      role: {
        type: DataTypes.ENUM("super_admin", "admin_ssb"),
        defaultValue: "admin_ssb",
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "user_admin",
      timestamps: false,
      underscored: true,
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );

  User.prototype.verifyPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  return User;
};