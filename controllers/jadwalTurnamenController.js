const { JadwalTurnamen, SSB, Siswa } = require("../models");
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

const createJadwalTurnamen = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const ssb_id = req.params.ssb_id;
    const { nama_turnamen, tanggal, time_start, time_end, age_grouping, location } = req.body;

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

    if (!nama_turnamen || !tanggal || !time_start || !time_end || !age_grouping) {
      return res.status(400).json({ 
        success: false, 
        message: "Nama turnamen, tanggal, waktu mulai, waktu selesai, dan kelompok umur wajib diisi" 
      });
    }

    const newJadwal = await JadwalTurnamen.create({
      nama_turnamen,
      tanggal,
      time_start,
      time_end,
      age_grouping,
      location: location || null,
      ssb_id
    });

    return res.status(201).json({ 
      success: true, 
      message: 'Jadwal turnamen berhasil ditambahkan',
      data: {
        id: newJadwal.id,
        nama_turnamen: newJadwal.nama_turnamen,
        tanggal: newJadwal.tanggal,
        time_start: newJadwal.time_start,
        time_end: newJadwal.time_end,
        age_grouping: newJadwal.age_grouping,
        location: newJadwal.location,
        ssb_id: newJadwal.ssb_id,
        created_at: newJadwal.created_at
      }
    });

  } catch (error) {
    console.error('Error create jadwal turnamen:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
};

const getAllJadwalTurnamen = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const ssb_id = req.params.ssb_id;
    const { age_grouping, month, year } = req.query;

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
    
    if (age_grouping) {
      whereClause.age_grouping = age_grouping;
    }

    if (month && year) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      whereClause.tanggal = {
        [Op.between]: [startDate, endDate]
      };
    } else if (year) {
      whereClause.tanggal = {
        [Op.gte]: `${year}-01-01`,
        [Op.lte]: `${year}-12-31`
      };
    }

    const jadwalList = await JadwalTurnamen.findAll({
      where: whereClause,
      order: [['tanggal', 'ASC'], ['time_start', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      message: 'Data jadwal turnamen berhasil diambil',
      data: jadwalList
    });

  } catch (error) {
    console.error('Error get all jadwal turnamen:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
};

const getJadwalTurnamenById = async (req, res) => {
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

    const jadwal = await JadwalTurnamen.findOne({
      where: {
        id,
        ssb_id
      }
    });

    if (!jadwal) {
      return res.status(404).json({ 
        success: false, 
        message: "Jadwal turnamen tidak ditemukan" 
      });
    }

    const jadwalData = jadwal.toJSON();

    return res.status(200).json({ 
      success: true,
      message: 'Data jadwal turnamen berhasil diambil',
      data: {
        ...jadwalData
      }
    });

  } catch (error) {
    console.error('Error get jadwal turnamen by id:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
};

const updateJadwalTurnamen = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const ssb_id = req.params.ssb_id;
    const { id } = req.params;
    const { nama_turnamen, tanggal, time_start, time_end, age_grouping, location } = req.body;

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
    
    const jadwal = await JadwalTurnamen.findOne({
      where: {
        id,
        ssb_id
      }
    });

    if (!jadwal) {
      return res.status(404).json({ 
        success: false, 
        message: "Jadwal turnamen tidak ditemukan" 
      });
    }

    const updateData = {};
    if (nama_turnamen !== undefined) updateData.nama_turnamen = nama_turnamen;
    if (tanggal !== undefined) updateData.tanggal = tanggal;
    if (time_start !== undefined) updateData.time_start = time_start;
    if (time_end !== undefined) updateData.time_end = time_end;
    if (age_grouping !== undefined) updateData.age_grouping = age_grouping;
    if (location !== undefined) updateData.location = location;

    await jadwal.update(updateData);

    return res.status(200).json({ 
      success: true,
      message: 'Jadwal turnamen berhasil diupdate',
      data: {
        id: jadwal.id,
        nama_turnamen: jadwal.nama_turnamen,
        tanggal: jadwal.tanggal,
        time_start: jadwal.time_start,
        time_end: jadwal.time_end,
        age_grouping: jadwal.age_grouping,
        location: jadwal.location,
        ssb_id: jadwal.ssb_id,
        created_at: jadwal.created_at
      }
    });

  } catch (error) {
    console.error('Error update jadwal turnamen:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
};

const deleteJadwalTurnamen = async (req, res) => {
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

    const jadwal = await JadwalTurnamen.findOne({
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
        message: "Jadwal turnamen tidak ditemukan" 
      });
    }

    await jadwal.destroy({ transaction });

    await transaction.commit();

    return res.status(200).json({ 
      success: true, 
      message: "Jadwal turnamen berhasil dihapus" 
    });

  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    console.error('Error delete jadwal turnamen:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
};

module.exports = {
  createJadwalTurnamen,
  getAllJadwalTurnamen,
  getJadwalTurnamenById,
  updateJadwalTurnamen,
  deleteJadwalTurnamen
};
