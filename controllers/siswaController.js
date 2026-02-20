const { Siswa, SSB } = require("../models");
const { sequelize } = require("../models");
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// Helper function untuk format foto URL
const formatSiswaResponse = (siswa, req) => {
  const siswaData = siswa.toJSON ? siswa.toJSON() : siswa;
  
  if (siswaData.foto) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    // Normalize path separator untuk URL (selalu gunakan /)
    const fotoPath = siswaData.foto.replace(/\\/g, '/');
    siswaData.foto = `${baseUrl}/${fotoPath}`;
  }
  
  return siswaData;
};

const createSiswa = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const ssb_id = req.params.ssb_id;
    const { name, age, position } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: "Nama siswa wajib diisi" 
      });
    }

    if (!position) {
      return res.status(400).json({ 
        success: false, 
        message: "Posisi siswa wajib diisi" 
      });
    }

    const validPositions = ['Kiper', 'Bek', 'Gelandang', 'Penyerang'];
    if (!validPositions.includes(position)) {
      return res.status(400).json({ 
        success: false, 
        message: `Posisi harus salah satu dari: ${validPositions.join(', ')}` 
      });
    }

    const ssb = await SSB.findByPk(ssb_id);
    
    if (!ssb) {
      return res.status(404).json({ 
        success: false, 
        message: "SSB tidak ditemukan" 
      });
    }

    if (ssb.admin_id !== adminId) {
      return res.status(403).json({ 
        success: false, 
        message: "Anda tidak memiliki akses ke SSB ini" 
      });
    }

    let fotoPath = null;
    if (req.file) {
      fotoPath = req.file.path;
    }

    const newSiswa = await Siswa.create({
      name: name.trim(),
      age: age || null,
      position,
      ssb_id,
      foto: fotoPath
    });

    // Format foto URL jika ada
    const fotoUrl = newSiswa.foto ? formatSiswaResponse(newSiswa, req).foto : null;

    return res.status(201).json({ 
      success: true, 
      message: 'Siswa berhasil ditambahkan',
      data: {
        id: newSiswa.id,
        name: newSiswa.name,
        age: newSiswa.age,
        position: newSiswa.position,
        foto: fotoUrl,
        isActive: newSiswa.isActive,
        ssb_id: newSiswa.ssb_id,
        created_at: newSiswa.created_at
      }
    });

  } catch (error) {
    console.error('Error create siswa:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
};

const getAllSiswa = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const ssb_id = req.params.ssb_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;
    const { position, isActive, search } = req.query;

    const ssb = await SSB.findByPk(ssb_id);
    
    if (!ssb) {
      return res.status(404).json({ 
        success: false, 
        message: "SSB tidak ditemukan" 
      });
    }

    if (ssb.admin_id !== adminId) {
      return res.status(403).json({ 
        success: false, 
        message: "Anda tidak memiliki akses ke SSB ini" 
      });
    }

    const whereClause = { ssb_id };
    
    if (position) {
      whereClause.position = position;
    }
    
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    if (search) {
      whereClause.name = { [sequelize.Op.like]: `%${search}%` };
    }

    const { count, rows: siswa } = await Siswa.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    // Format foto URL untuk setiap siswa
    const siswaWithFormattedFoto = siswa.map(s => {
      const siswaData = s.toJSON();
      if (siswaData.foto) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const fotoPath = siswaData.foto.replace(/\\/g, '/');
        siswaData.foto = `${baseUrl}/${fotoPath}`;
      }
      return siswaData;
    });

    return res.status(200).json({
      success: true,
      message: 'Data siswa berhasil diambil',
      data: siswaWithFormattedFoto,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error get all siswa:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
}

const getSiswaById = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const ssb_id = req.params.ssb_id;
    const { id } = req.params;

    const ssb = await SSB.findByPk(ssb_id);
    
    if (!ssb) {
      return res.status(404).json({ 
        success: false, 
        message: "SSB tidak ditemukan" 
      });
    }

    if (ssb.admin_id !== adminId) {
      return res.status(403).json({ 
        success: false, 
        message: "Anda tidak memiliki akses ke SSB ini" 
      });
    }

    const siswa = await Siswa.findOne({
      where: {
        id,
        ssb_id
      }
    });

    if (!siswa) {
      return res.status(404).json({ 
        success: false, 
        message: "Siswa tidak ditemukan" 
      });
    }

    // Format foto URL jika ada
    const siswaData = siswa.toJSON();
    if (siswaData.foto) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const fotoPath = siswaData.foto.replace(/\\/g, '/');
      siswaData.foto = `${baseUrl}/${fotoPath}`;
    }

    return res.status(200).json({ 
      success: true,
      message: 'Data siswa berhasil diambil',
      data: siswaData
    });
  } catch (error) {
    console.error('Error get siswa by id:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
};

const updateSiswa = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const ssb_id = req.params.ssb_id;
    const { id } = req.params;
    const { name, age, position, isActive } = req.body;

    const ssb = await SSB.findByPk(ssb_id);
    
    if (!ssb) {
      return res.status(404).json({ 
        success: false, 
        message: "SSB tidak ditemukan" 
      });
    }

    if (ssb.admin_id !== adminId) {
      return res.status(403).json({ 
        success: false, 
        message: "Anda tidak memiliki akses ke SSB ini" 
      });
    }

    const siswa = await Siswa.findOne({
      where: {
        id,
        ssb_id
      }
    });

    if (!siswa) {
      return res.status(404).json({ 
        success: false, 
        message: "Siswa tidak ditemukan" 
      });
    }

    if (position) {
      const validPositions = ['Kiper', 'Bek', 'Gelandang', 'Penyerang'];
      if (!validPositions.includes(position)) {
        return res.status(400).json({ 
          success: false, 
          message: `Posisi harus salah satu dari: ${validPositions.join(', ')}` 
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (age !== undefined) updateData.age = age || null;
    if (position !== undefined) updateData.position = position;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (req.file) {
      if (siswa.foto) {
        const oldFotoPath = path.join(process.cwd(), siswa.foto);
        if (fs.existsSync(oldFotoPath)) {
          fs.unlinkSync(oldFotoPath);
        }
      }
      updateData.foto = req.file.path;
    }

    await siswa.update(updateData);

    // Format foto URL jika ada
    const siswaData = siswa.toJSON();
    if (siswaData.foto) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const fotoPath = siswaData.foto.replace(/\\/g, '/');
      siswaData.foto = `${baseUrl}/${fotoPath}`;
    }

    return res.status(200).json({ 
      success: true,
      message: 'Siswa berhasil diupdate',
      data: siswaData
    });

  } catch (error) {
    console.error('Error update siswa:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
};


const deleteSiswa = async (req, res) => {
  let transaction;

  try {
    const adminId = req.user.userId;
    const ssb_id = req.params.ssb_id;
    const { id } = req.params;

    transaction = await sequelize.transaction();

    const ssb = await SSB.findByPk(ssb_id, { transaction });
    
    if (!ssb) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false, 
        message: "SSB tidak ditemukan" 
      });
    }

    if (ssb.admin_id !== adminId) {
      await transaction.rollback();
      return res.status(403).json({ 
        success: false, 
        message: "Anda tidak memiliki akses ke SSB ini" 
      });
    }

    const siswa = await Siswa.findOne({
      where: {
        id,
        ssb_id
      },
      transaction
    });

    if (!siswa) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false, 
        message: "Siswa tidak ditemukan" 
      });
    }

    if (siswa.foto) {
      const fotoPath = path.join(process.cwd(), siswa.foto);
      if (fs.existsSync(fotoPath)) {
        fs.unlinkSync(fotoPath);
      }
    }

    await siswa.destroy({ transaction });

    await transaction.commit();

    return res.status(200).json({ 
      success: true, 
      message: "Siswa berhasil dihapus" 
    });

  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    console.error('Error delete siswa:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
};


module.exports = {
  createSiswa,
  getAllSiswa,
  getSiswaById,
  updateSiswa,
  deleteSiswa
};