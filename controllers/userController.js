const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { UserAdmin, sequelize } = require('../models');


const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: "Validasi gagal", 
        errors: errors.array() 
      });
    }

    const { name, email, password } = req.body;

    const existingUser = await UserAdmin.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        message: 'Email sudah terdaftar. Silakan login.' 
      });
    }

    const newUser = await UserAdmin.create({
      name,
      email,
      password,
      role: 'admin_ssb',
    });

    return res.status(201).json({ 
      success: true, 
      message: 'Registrasi berhasil, silakan login.',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Registrasi error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
};


const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: "Validasi gagal", 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    const user = await UserAdmin.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Kredensial tidak valid' });
    }


    const isValidPassword = await user.verifyPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Kredensial tidak valid' });
    }

    const payload = { userId: user.id, role: user.role };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET
    );

    return res.status(200).json({ success: true, message: 'Login berhasil',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ success: false, error: 'Terjadi kesalahan server' });
  }
};

const getCurrentUser = async (req, res) => {

  const userId = req.user.userId;

  const user = await UserAdmin.findByPk(userId, {
    attributes: ['id','name','email','role']
  });

  return res.json({ success: true, data: user });
}

const updateCurrentUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: "Format salah", errors: errors.array() });
  }

  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.userId;
    const user = await UserAdmin.findByPk(userId, { transaction });
    
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }

    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await UserAdmin.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('email')),
          sequelize.fn('LOWER', req.body.email)
        ),
        transaction
      });
      if (emailExists) {
        await transaction.rollback();
        return res.status(409).json({ success: false, message: "Email sudah digunakan" });
      }
    }

    const allowedFields = ['name', 'email', 'password'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await user.update(updateData, { transaction });
    await transaction.commit();

    const updatedUser = await UserAdmin.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role']
    });
    
    return res.status(200).json({ 
      success: true, 
      message: "Profile berhasil diupdate",
      data: updatedUser 
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
    try {
      const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ 
            success: false, 
            message: "Validasi gagal", 
            errors: errors.array() 
          });
        }
        const { email, password } = req.body;
        
        if (!password || password.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: "Password diperlukan" 
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: "Password minimal 6 karakter" 
            });
        }

        // Cari user berdasarkan email
        const user = await UserAdmin.findOne({ where: { email: email.toLowerCase() } });
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User dengan email tersebut tidak ditemukan" 
            });
        }

        await user.update({ password });

        return res.status(200).json({ 
            success: true, 
            message: "Password berhasil diubah. Silakan login dengan password baru" 
        });

    } catch (error) {
        console.error("Error di resetPassword:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Terjadi kesalahan server" 
        });
    }
};

const deleteCurrentUser = async (req, res) => {
  let transaction;
  try {
    const userId = req.user.userId;
    transaction = await sequelize.transaction();
    const user = await UserAdmin.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: "User tidak ditemukan" });
    }
    await user.destroy({ transaction });
    await transaction.commit();
    return res.status(200).json({ success: true, message: "User berhasil dihapus" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    return res.status(500).json({ success: false, error: error.message });
  }
};



module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateCurrentUser,
  resetPassword,
  deleteCurrentUser
};