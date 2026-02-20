require('dotenv').config();
console.log(process.env.DB_HOST);
const cors = require('cors');
const express = require('express');
const sequelize = require('./config/sequelize');
const { UserAdmin, SSB, Siswa, JadwalLatihan, JadwalTurnamen } = require('./models');
const userRoutes = require('./routes/userRoutes');
const ssbRoutes = require('./routes/ssbRoutes');
const siswaRoutes = require('./routes/siswaRoutes');
const app = express();
const PORT = process.env.PORT || 5000;

// set body parser

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving untuk foto siswa
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/user', userRoutes);
app.use('/api/ssb', ssbRoutes);
app.use('/api/ssb/:ssb_id/siswa', siswaRoutes);

sequelize.sync({ alter: true, logging: console.log })
  .then(() => console.log('Database synced!'))
  .catch(err => console.error('Sync error:', err));
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));







