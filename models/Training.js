'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Training extends Model {
    static associate(models) {
      Training.hasMany(models.Chapter, { foreignKey: 'trainingId' });
    }
  }

  Training.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    department: {
      type: DataTypes.TEXT
    },
    passcode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Training',
    timestamps: true // Automatically adds createdAt and updatedAt
  });

  return Training;
};
