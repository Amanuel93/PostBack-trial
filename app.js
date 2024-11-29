const express = require('express');
const app = express();
const db = require('./models'); // Import models
const traineeRoutes = require('./routes/trainee');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const createSuperAdminIfNotExists = require('./controllers/systemController')
const path = require('path');
const cron = require('node-cron');

const corsOptions = {
  origin: 'http://localhost:5173', // Replace with your frontend's domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use(express.json());

// Route to create a new user
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/trainee', traineeRoutes);

// Static file serving for images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

cron.schedule('* * * * *', async () => {
  console.log('Checking ongoing training sessions...');
  await autoSubmitTraining();
});

// Test the database connection and sync models
db.sequelize.authenticate()
  .then(() => {
    console.log('Database connected.');
    return db.sequelize.sync({force:false}); // Sync models with the database
  })
  .then(() => {
    createSuperAdminIfNotExists.createSuperAdminIfNotExists();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.log('Error: ', err);
  });
