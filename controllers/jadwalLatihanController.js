const { JadwalLatihan, SSB, Siswa } = require("../models");
const { sequelize } = require("../models");
const { Op } = require('sequelize');

// Helper function untuk mapping age_grouping ke range umur
const getAgeRange = (ageGrouping) => {
  const ranges = {
    'U-10': { max: 10 },
    'U-12': { max: 12 },
    'U-15': { max: 15 },
    'U-17': { max: 17 },
    'U-20': { max: 20 },
    'Senior': { min: 21 }
  };
  return ranges[ageGrouping] || null;
};

const createJadwalLatihan = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const ssb_id = req.params.ssb_id;
    const { day, time_start, time_end, age_grouping } = req.body;

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

    if (!day || !time_start || !time_end || !age_grouping) {
      return res.status(400).json({ 
        success: false, 
        message: "Hari, waktu mulai, waktu selesai, dan kelompok umur wajib diisi" 
      });
    }

    const newJadwal = await JadwalLatihan.create({
      day,
      time_start,
      time_end,
      age_grouping,
      ssb_id
    });

    return res.status(201).json({ 
      success: true, 
      message: 'Jadwal latihan berhasil ditambahkan',
      data: {
        id: newJadwal.id,
        day: newJadwal.day,
        time_start: newJadwal.time_start,
        time_end: newJadwal.time_end,
        age_grouping: newJadwal.age_grouping,
        ssb_id: newJadwal.ssb_id,
        created_at: newJadwal.created_at
      }
    });

  } catch (error) {
    console.error('Error create jadwal latihan:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
};

const getAllJadwalLatihan = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const ssb_id = req.params.ssb_id;
    const { day, age_grouping } = req.query;

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
    
    if (day) {
      whereClause.day = day;
    }
    
    if (age_grouping) {
      whereClause.age_grouping = age_grouping;
    }

    const jadwalList = await JadwalLatihan.findAll({
      where: whereClause,
      order: [
        [sequelize.literal("FIELD(day, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu')"), 'ASC'],
        ['time_start', 'ASC']
      ]
    });

    return res.status(200).json({
      success: true,
      message: 'Data jadwal latihan berhasil diambil',
      data: jadwalList
    });

  } catch (error) {
    console.error('Error get all jadwal latihan:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
};

const getJadwalLatihanById = async (req, res) => {
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

    const jadwal = await JadwalLatihan.findOne({
      where: {
        id,
        ssb_id
      }
    });

    if (!jadwal) {
      return res.status(404).json({ 
        success: false, 
        message: "Jadwal latihan tidak ditemukan" 
      });
    }

    const ageRange = getAgeRange(jadwal.age_grouping);
    let siswaWhereClause = { 
      ssb_id,
      isActive: true 
    };

    if (ageRange) {
      if (ageRange.max) {
        siswaWhereClause.age = {
          [Op.lte]: ageRange.max,
          [Op.gte]: ageRange.max === 10 ? 5 : ageRange.max - 2
        };
      } else if (ageRange.min) {
        siswaWhereClause.age = {
          [Op.gte]: ageRange.min
        };
      }
    }

    const siswaList = await Siswa.findAll({
      where: siswaWhereClause,
      attributes: ['id', 'name', 'age', 'position', 'foto'],
      order: [['name', 'ASC']]
    });

    const siswaWithFormattedFoto = siswaList.map(s => {
      const siswaData = s.toJSON();
      if (siswaData.foto) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const fotoPath = siswaData.foto.replace(/\\/g, '/');
        siswaData.foto = `${baseUrl}/${fotoPath}`;
      }
      return siswaData;
    });

    const jadwalData = jadwal.toJSON();

    return res.status(200).json({ 
      success: true,
      message: 'Data jadwal latihan berhasil diambil',
      data: {
        ...jadwalData,
        siswa: siswaWithFormattedFoto,
        jumlah_siswa: siswaWithFormattedFoto.length
      }
    });

  } catch (error) {
    console.error('Error get jadwal latihan by id:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
};

const updateJadwalLatihan = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const ssb_id = req.params.ssb_id;
    const { id } = req.params;
    const { day, time_start, time_end, age_grouping } = req.body;

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

    const jadwal = await JadwalLatihan.findOne({
      where: {
        id,
        ssb_id
      }
    });

    if (!jadwal) {
      return res.status(404).json({ 
        success: false, 
        message: "Jadwal latihan tidak ditemukan" 
      });
    }

    const updateData = {};
    if (day !== undefined) updateData.day = day;
    if (time_start !== undefined) updateData.time_start = time_start;
    if (time_end !== undefined) updateData.time_end = time_end;
    if (age_grouping !== undefined) updateData.age_grouping = age_grouping;

    await jadwal.update(updateData);

    return res.status(200).json({ 
      success: true,
      message: 'Jadwal latihan berhasil diupdate',
      data: {
        id: jadwal.id,
        day: jadwal.day,
        time_start: jadwal.time_start,
        time_end: jadwal.time_end,
        age_grouping: jadwal.age_grouping,
        ssb_id: jadwal.ssb_id,
        created_at: jadwal.created_at
      }
    });

  } catch (error) {
    console.error('Error update jadwal latihan:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
};

const deleteJadwalLatihan = async (req, res) => {
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

    const jadwal = await JadwalLatihan.findOne({
      where: {
        id,
        ssb_id
      },
      transaction
    });

    if (!jadwal) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false, 
        message: "Jadwal latihan tidak ditemukan" 
      });
    }

    await jadwal.destroy({ transaction });

    await transaction.commit();

    return res.status(200).json({ 
      success: true, 
      message: "Jadwal latihan berhasil dihapus" 
    });

  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    console.error('Error delete jadwal latihan:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
};

module.exports = {
  createJadwalLatihan,
  getAllJadwalLatihan,
  getJadwalLatihanById,
  updateJadwalLatihan,
  deleteJadwalLatihan
};
