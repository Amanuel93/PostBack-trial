const bcrypt = require('bcryptjs');
const {User} = require('../models'); // Adjust the path to your User model as needed
const { TraineeProgress } = require('../models');

exports.createSuperAdminIfNotExists = async () => {
    try {
      const superAdminEmail = process.env.SUPERADMIN_EMAIL;
      const superAdminPassword = process.env.SUPERADMIN_PASSWORD;
  
      // Check if the superadmin already exists
      const superAdminExists = await User.findOne({ where: { email: superAdminEmail, role: 'super-admin' } });
  
      if (!superAdminExists) {
        // Hash the password
        const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
  
        // Create the superadmin user
        await User.create({
          name: 'Super Admin', // default name, can be changed
          email: superAdminEmail,
          password: hashedPassword,
          role: 'super-admin',
          isVerified: true, // Assuming superadmin should be verified by default
        });
  
        console.log('Superadmin created successfully.');
      } else {
        console.log('Superadmin already exists.');
      }
    } catch (error) {
      console.error('Error creating superadmin:', error);
    }
  };

  exports.autoSubmitTraining = async () => {
    const currentTime = new Date();
    const ongoingTrainings = await TraineeProgress.findAll({
      where: {
        status: 'in-progress',
        endTime: { [Op.lte]: currentTime }, // Check for trainings where the end time has passed
      },
    });
  
    for (const progress of ongoingTrainings) {
      if (progress.status === 'in-progress' && currentTime >= progress.endTime) {
        progress.status = 'expired'; // Set status to expired if not completed before endTime
        await progress.save();
      }
    }
  };
  
