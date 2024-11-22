'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true // Validates email format
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    years_of_experience: {
      type: DataTypes.STRING,
      allowNull: true
    },
    experience_detail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    birthplace: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },

    role: {
      type: DataTypes.ENUM('admin', 'super-admin', 'trainee'),
      allowNull: false,
      defaultValue: 'trainee'
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    resetPasswordToken: {
      type: DataTypes.STRING // Token for email verification
    },
    resetPasswordExpires: {
      type: DataTypes.DATE, // Token for email verification
    }
  }, {
    sequelize,
    modelName: 'User',
    timestamps: true // Automatically adds createdAt and updatedAt
  });

  return User;
};