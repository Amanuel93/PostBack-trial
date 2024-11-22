'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Feedback extends Model {
    static associate(models) {
      // Define associations here
      Feedback.belongsTo(models.User, { foreignKey: 'userId' });
      Feedback.belongsTo(models.Training, { foreignKey: 'trainingId' });
    }
  }

  Feedback.init({
    issueText: {
      type: DataTypes.STRING,
      allowNull: false // Issue text cannot be null
    },
    adminResponse: {
      type: DataTypes.STRING // Optional response from admin
    }
  }, {
    sequelize,
    modelName: 'Feedback',
    timestamps: true // Automatically adds createdAt and updatedAt
  });

  return Feedback;
};
