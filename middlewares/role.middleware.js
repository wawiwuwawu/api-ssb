const adminOnly = (req, res, next) => {

  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak: Hanya admin yang diizinkan"
    });
  }
  next();
};

module.exports = { adminOnly };