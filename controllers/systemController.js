const bcrypt = require('bcryptjs');
const {User} = require('../models'); // Adjust the path to your User model as needed

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
