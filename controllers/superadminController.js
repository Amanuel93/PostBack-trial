const { User } = require('../models'); // Import the User model
const bcrypt = require('bcryptjs'); // For password hashing
const { Op } = require('sequelize');

// Create Admin
exports.createAdmin = async (req, res) => {
  try {
    const { name, email,phone, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check for existing admin
    const existingAdmin = await User.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin with this email already exists.' });
    }
    // Create new admin
    const newAdmin = await User.create({
      name,
      email,
      phone,
      password,
      role: 'admin', // Set the role to admin
      isVerified: true
    });

    res.status(201).json({ message: 'Admin created successfully.', admin: newAdmin });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: 'Error creating admin.' });
  }
};

// Delete Admin
exports.deleteAdmin = async (req, res) => {
    try {
      const { id } = req.params; 
  
      // Find the admin by ID
      const adminToDelete = await User.findOne({ where: { id, role: 'admin' } });
  
      // Check if the admin exists
      if (!adminToDelete) {
        return res.status(404).json({ error: 'Admin not found.' });
      }
  
      // Delete the admin
      await User.destroy({ where: { id } });
  
      res.status(200).json({ message: 'Admin deleted successfully!' });
    } catch (error) {
      console.error('Error deleting admin:', error);
      res.status(500).json({ error: 'Error deleting admin.' });
    }
  };

  exports.getAdmins = async (req, res) => {
    try {

      // Find all users with the role of 'admin'
      const admins = await User.findAll({
        where: { role: 'admin' },
        attributes: ['id', 'name', 'email','password', 'isVerified', 'createdAt'] // Select relevant fields only
      });
  
      // If there are no admins, return a message
      if (admins.length === 0) {
        return res.status(404).json({ message: 'No admins found.' });
      }
  
      // Return the list of admins
      res.status(200).json({ admins });
    } catch (error) {
      console.error('Error fetching admins:', error);
      res.status(500).json({ error: 'Error fetching admins.' });
    }
  };
  
  
  
