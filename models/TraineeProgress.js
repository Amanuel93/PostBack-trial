'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TraineeProgress extends Model {
    static associate(models) {
      // Define associations here
      TraineeProgress.belongsTo(models.User, { foreignKey: 'userId' });
      TraineeProgress.belongsTo(models.Training, { foreignKey: 'trainingId' });
    }
  }

  TraineeProgress.init({
    startTime: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    endTime: {
      type: DataTypes.DATE
    },
    status: {
      type: DataTypes.ENUM('completed', 'in-progress', 'expired'),
      defaultValue: 'in-progress'
    },
    pass: {
      type: DataTypes.BOOLEAN // Indicates whether the trainee has passed or failed
    },
    score: {
      type: DataTypes.INTEGER, // Stores the score percentage
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'TraineeProgress',
    timestamps: true // Automatically adds createdAt and updatedAt
  });

  return TraineeProgress;
};
