// Create Multiple Questions
const { Question } = require('../models'); // Import Sequelize models
const { Op } = require('sequelize');

exports.createQuestions = async (req, res) => {
  try {
    const { questions } = req.body;
    const { chapterId,trainingId } = req.params;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Questions array is required and cannot be empty' });
    }

    const questionsWithChapter = questions.map((question) => {
      const { questionText, correctAnswer, type } = question;
      const options = [question.optionA, question.optionB, question.optionC, question.optionD];

      if (type === 'multiple-choice') {
        if (!options.includes(correctAnswer)) {
          throw new Error(`Correct answer "${correctAnswer}" does not match any options for question: ${questionText}`);
        }
      } else if (type === 'true-false') {
        if (correctAnswer !== 'true' && correctAnswer !== 'false') {
          throw new Error(`True/False question requires a correct answer of "true" or "false" for question: ${questionText}`);
        }
      } else {
        throw new Error(`Unsupported question type: ${type}`);
      }

      return {
        questionText,
        options: type === 'multiple-choice' ? options : null,
        correctAnswer,
        chapterId,
        trainingId,
        type,
      };
    });

    const createdQuestions = await Question.bulkCreate(questionsWithChapter);
    res.status(201).json(createdQuestions);
  } catch (error) {
    res.status(400).json({ error: 'Error creating questions.', details: error.message });
  }
};


  // Update Question
  exports.updateQuestion = async (req, res) => {
    try {
      const { id } = req.params;
      const { questionText, type, options, correctAnswer, chapterId } = req.body;
  
      // Validate correctAnswer against options
      if (type === 'multiple-choice' && !options.includes(correctAnswer)) {
        return res.status(400).json({
          error: `Invalid correct answer for question: ${questionText}`
        });
      }
  
      const updatedQuestion = await Question.update({
        questionText,
        type,
        options,
        correctAnswer,
        chapterId
      }, { where: { id }, returning: true });
  
      if (updatedQuestion[0] === 0) return res.status(404).json({ error: 'Question not found.' });
  
      res.status(200).json(updatedQuestion[1][0]);
    } catch (error) {
      res.status(400).json({ error: 'Error updating question.', details: error.message });
    }
  };
  
  // Delete Question
  exports.deleteQuestion = async (req, res) => {
    try {
      const { id } = req.params;
      await Question.destroy({ where: { id } });
      res.status(200).send({ message: 'Question deleted successfully!' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting question.' });
    }
  };