const crypto = require('crypto');
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {sendMail, passowordReset, passwordReset} = require('../utils/mailer');
const { Op } = require('sequelize');

exports.registerUser = async (req, res) => {
  try {
    const { name, phone, role, email, password } = req.body;

    // Check if email or username already exists
    const existingUser = await User.findOne({ where: { [Op.or]: [{ email }] } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or Username already exists.' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      phone,
      role,
      email,
      password: hashedPassword,
      isVerified: false
    });

    // Generate a verification JWT token (valid for 1 hour)
    const verificationToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET, // Store this secret key in environment variables
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Send verification email
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;
    await sendMail(email, 'Verify your email',verificationUrl  );

    res.status(201).json({ message: 'User registered successfully. Please check your email to verify your account.' ,verificationToken});
  } catch (error) {
    res.status(500).json({ message: 'Error registering user.'});
    console.log(error)
  }
};

// Email Verification Handler
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by the decoded token's ID
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    // If the user is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified.' });
    }

    // Update the user's verification status
    user.isVerified = true;
    await user.save();

    res.redirect('http://localhost:5173/Login');

    // res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ message: 'Error verifying email.' });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }
    console.log(user);

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email before logging in.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      completed: user.completed,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      // Add any other fields you want to include in the response
    };

    // Generate JWT token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const userDetail = {
        userResponse,
        token,
    };
    
    res.status(200).json(userDetail);
  } catch (error) {
    res.status(500).json({ message: 'Error logging in.' });
    console.log(error)
  }
};

// Request to reset password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'User with that email does not exist.' });
    }

    // Create a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the reset token before saving it to the database
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save the hashed reset token and its expiration time (1 hour from now)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration

    await user.save();

    // Create the reset URL containing the original (non-hashed) token
    const resetUrl = `http://localhost:5173/Reset-Password/${resetToken}`;

    // Send reset email
    await passwordReset(email, 'Password Reset', resetUrl);

    res.status(200).json({ message: 'Password reset email sent.',resetToken });
    console.log(resetToken);
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ message: 'Error sending password reset email.' });
  }
};

// Handle password reset
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Hash the token before querying the database, since we saved it as a hashed value
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find the user by the hashed token and check if the token hasn't expired
    const user = await User.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { [Op.gt]: Date.now() } // Ensure token is not expired
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    // Hash the new password and update the user's password
    user.password = await bcrypt.hash(newPassword, 10);

    // Clear the reset token and expiration
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Error resetting password.' });
  }
};

