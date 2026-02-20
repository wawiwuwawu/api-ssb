const { SSB, Siswa } = require("../models");
const { sequelize } = require("../models");

// Helper function untuk format foto URL siswa
const formatSiswaFoto = (siswa, req) => {
  const siswaData = siswa.toJSON ? siswa.toJSON() : siswa;
  
  if (siswaData.foto) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fotoPath = siswaData.foto.replace(/\\/g, '/');
    siswaData.foto = `${baseUrl}/${fotoPath}`;
  }
  
  return siswaData;
};

const errorResponse = (res, status, message) => {
  return res.status(status).json({ success: false, error: message });
};


const createSSB = async (req, res) => {
  try {
    const { name } = req.body;
    const adminId = req.user.userId;

    if (!name || name.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: "Nama SSB wajib diisi" 
      });
    }

    const existing = await SSB.findOne({
      where: {
        admin_id: adminId,
        name: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('name')),
          sequelize.fn('LOWER', name.trim())
        )
      }
    });

    if (existing) {
      return res.status(409).json({ 
        success: false, 
        message: "SSB dengan nama tersebut sudah ada" 
      });
    }

    const newSSB = await SSB.create({
      name: name.trim(),
      admin_id: adminId
    });

    return res.status(201).json({ 
      success: true, 
      message: 'SSB berhasil dibuat',
      data: {
        id: newSSB.id,
        name: newSSB.name,
        admin_id: newSSB.admin_id,
        created_at: newSSB.created_at
      }
    });

  } catch (error) {
    console.error('Error create SSB:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
};

const getAllSsb = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    const { count, rows: ssbs } = await SSB.findAndCountAll({
      where: { admin_id: adminId },
      attributes: ['id', 'name', 'created_at'],
      include: [
        {
          model: Siswa,
          as: 'siswas',
          attributes: ['id', 'name', 'position'],
          required: false 
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    const formattedData = ssbs.map(ssb => ({
      id: ssb.id,
      name: ssb.name,
      created_at: ssb.created_at,
      jumlah_siswa: ssb.siswas ? ssb.siswas.length : 0,
      siswa: ssb.siswas || []
    }));

    return res.status(200).json({
      success: true,
      data: formattedData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error get all SSB:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
};

const getSsbById = async (req, res) => {
  try {
    const { id } = req.params;
    const ssb = await SSB.findByPk(id);
    if (!ssb) {
      return errorResponse(res, 404, "SSB tidak ditemukan");
    }
    return res.status(200).json({ success: true, data: ssb });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

const getSsbByIdDetail = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { id } = req.params;

    const ssb = await SSB.findByPk(id, {
      include: [
        {
          model: Siswa,
          as: 'siswas',
          attributes: ['id', 'name', 'age', 'position', 'foto', 'created_at', 'isActive']
        }
      ]
    });

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

    // Statistik posisi siswa
    const siswas = ssb.siswas || [];
    const statistikPosisi = {
      kiper: siswas.filter(s => s.position === 'Kiper').length,
      bek: siswas.filter(s => s.position === 'Bek').length,
      gelandang: siswas.filter(s => s.position === 'Gelandang').length,
      penyerang: siswas.filter(s => s.position === 'Penyerang').length
    };

    // Format foto URL untuk setiap siswa
    const siswaWithFormattedFoto = siswas.map(s => formatSiswaFoto(s, req));

    return res.status(200).json({
      success: true,
      data: {
        id: ssb.id,
        name: ssb.name,
        created_at: ssb.created_at,
        jumlah_siswa: siswas.length,
        statistik_posisi: statistikPosisi,
        siswa: siswaWithFormattedFoto
      }
    });

  } catch (error) {
    console.error('Error get SSB detail:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
};

const updateSsb = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: "Nama SSB wajib diisi" 
      });
    }

    const ssb = await SSB.findByPk(id);
    
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

    if (name.trim().toLowerCase() !== ssb.name.toLowerCase()) {
      const existing = await SSB.findOne({
        where: {
          admin_id: adminId,
          name: sequelize.where(
            sequelize.fn('LOWER', sequelize.col('name')),
            sequelize.fn('LOWER', name.trim())
          )
        }
      });

      if (existing) {
        return res.status(409).json({ 
          success: false, 
          message: "SSB dengan nama tersebut sudah ada" 
        });
      }
    }

    await ssb.update({ name: name.trim() });

    return res.status(200).json({ 
      success: true, 
      message: 'SSB berhasil diupdate',
      data: {
        id: ssb.id,
        name: ssb.name,
        admin_id: ssb.admin_id,
        created_at: ssb.created_at
      }
    });

  } catch (error) {
    console.error('Error update SSB:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
};

const deleteSsb = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const adminId = req.user.userId;
    const { id } = req.params;

    const ssb = await SSB.findByPk(id, { transaction });

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

    await ssb.destroy({ transaction });

    await transaction.commit();

    return res.status(200).json({ 
      success: true, 
      message: "SSB berhasil dihapus" 
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error delete SSB:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
};

module.exports = {
  createSSB,
  getAllSsb,
  getSsbById,
  deleteSsb,
  getSsbByIdDetail,
  updateSsb
};
