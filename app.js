require('dotenv').config();
console.log(process.env.DB_HOST);
const cors = require('cors');
const express = require('express');
const sequelize = require('./config/sequelize');
const { UserAdmin, SBB, Siswa } = require('./models'); // Import models
// const userRoutes = require('./routes/userRoutes');
const app = express();
const PORT = process.env.PORT || 5000;

// set body parser

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use('/api/user', userRoutes);

sequelize.sync({ alter: true, logging: console.log })
  .then(() => console.log('Database synced!'))
  .catch(err => console.error('Sync error:', err));
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));







