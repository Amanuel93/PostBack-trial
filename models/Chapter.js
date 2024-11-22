'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Chapter extends Model {
    static associate(models) {
      // Define associations here
      Chapter.belongsTo(models.Training, { foreignKey: 'trainingId' });
    }
  }
  Chapter.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    chapterNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    readingMaterial: {
      type: DataTypes.STRING, // Stores PDF path
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Chapter',
    timestamps: true // Automatically adds createdAt and updatedAt
  });

  return Chapter;
};
