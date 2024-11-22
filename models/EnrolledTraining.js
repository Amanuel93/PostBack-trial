'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EnrolledTraining extends Model {
    static associate(models) {
      // Define associations here
      EnrolledTraining.belongsTo(models.User, { foreignKey: 'userId' });
      EnrolledTraining.belongsTo(models.Training, { foreignKey: 'trainingId' });
      models.User.hasMany(EnrolledTraining, { foreignKey: 'userId' });
      models.Training.hasMany(EnrolledTraining, { foreignKey: 'trainingId' });
    }
  }

  EnrolledTraining.init({
    status: {
      type: DataTypes.ENUM('in-progress', 'completed', 'expired', 'planned'),
      defaultValue: 'planned'
    },
    plannedDate: {
      type: DataTypes.DATE
    },
    startDate: {
      type: DataTypes.DATE
    },
    completionDate: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'EnrolledTraining',
    timestamps: true // Automatically adds createdAt and updatedAt
  });

  return EnrolledTraining;
};
