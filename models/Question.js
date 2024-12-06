'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      // Define associations here
      Question.belongsTo(models.Chapter, { foreignKey: 'chapterId' });
      models.Chapter.hasMany(Question, { foreignKey: 'chapterId' });
      models.Training.hasMany(Question, { foreignKey: 'trainingId' });
    }
  }

  Question.init({
    questionText: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('multiple-choice', 'true-false'),
      allowNull: false
    },
    options: {
      type: DataTypes.JSON, // Use JSONB to store options
      allowNull: true
    },
    correctAnswer: {
      type: DataTypes.STRING, // For both true-false and multiple-choice
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Question',
    timestamps: true // Automatically adds createdAt and updatedAt
  });

  return Question;
};
