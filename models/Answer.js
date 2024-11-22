'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Answer extends Model {
    static associate(models) {
      // Define associations here
      Answer.belongsTo(models.User, { foreignKey: 'userId' });
      Answer.belongsTo(models.Training, { foreignKey: 'trainingId' });
      Answer.belongsTo(models.Chapter, { foreignKey: 'chapterId' });
      Answer.belongsTo(models.Question, { foreignKey: 'questionId' });
    }
  }

  Answer.init({
    selectedOption: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Answer',
    timestamps: true // Automatically adds createdAt and updatedAt
  });

  return Answer;
};
