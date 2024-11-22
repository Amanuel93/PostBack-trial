// Get trainee info, training, and score (Admin Only)
const {TraineeProgress,Training,Question,User} = require('../models');
const { Op } = require('sequelize');
const moment = require('moment'); 
const sequelize = require('sequelize');

exports.getTraineeInfo = async (req, res) => {
    try {
      const { traineeId } = req.params;
  
      // Find the trainee's progress
      const progress = await TraineeProgress.findAll({
        where: { userId: traineeId }, // traineeId passed in params
        include: [
          {
            model: Training,
            attributes: ['title', 'startDate', 'endDate', 'duration'] // Get relevant training details
          },
          {
            model: User,
            attributes: ['name', 'email', 'role'], // Get trainee's personal info
          }
        ]
      });
  
      // If no progress found for the trainee
      if (!progress || progress.length === 0) {
        return res.status(404).json({ message: 'No training progress found for this trainee.' });
      }
  
      // Return trainee info and their progress
      res.status(200).json({
        message: 'Trainee info and training progress retrieved successfully',
        progress // This contains the trainee's info, the trainings they've taken, and their scores
      });
    } catch (error) {
      console.error('Error fetching trainee info:', error);
      return res.status(500).json({ message: 'An error occurred while fetching trainee info.', error });
    }
  };
  
 exports.getSystemSummary = async (req, res) => {
  try {
    // Count users by role
    const traineeCount = await User.count({ where: { role: 'trainee' } });
    const adminCount = await User.count({ where: { role: 'admin' } });
    
    // Count total trainings
    const trainingCount = await Training.count();

    // Count total questions
    const questionCount = await Question.count();

    // Send response with all counts
    res.status(200).json({
      trainees: traineeCount,
      admins: adminCount,
      trainings: trainingCount,
      questions: questionCount
    });
  } catch (error) {
    console.error('Error fetching system summary:', error);
    res.status(500).json({ error: 'Error fetching system summary.' });
  }
};

exports.getPassFailSummary = async (req, res) => {
  try {
    // Count trainees who passed
    const passedCount = await TraineeProgress.count({ where: { pass: true } });

    // Count trainees who failed
    const failedCount = await TraineeProgress.count({ where: { pass: false } });

    // Send response with pass/fail counts
    res.status(200).json({
      passedTrainees: passedCount,
      failedTrainees: failedCount
    });
  } catch (error) {
    console.error('Error fetching pass/fail summary:', error);
    res.status(500).json({ error: 'Error fetching pass/fail summary.' });
  }
};

exports.getSixMonthActivity = async (req, res) => {
  try {
    // Get the last six months
    const currentDate = moment();
    const sixMonthsAgo = currentDate.clone().subtract(5, 'months').startOf('month');

    // Generate an array for the last six months, formatted as month names
    const months = [];
    for (let i = 0; i < 6; i++) {
      months.push(sixMonthsAgo.clone().add(i, 'months').format('MMMM'));
    }

    // Fetch unique trainees with 'completed' or 'in-progress' trainings within the last six months
    const traineeData = await TraineeProgress.findAll({
      where: {
        status: { [Op.or]: ['completed', 'in-progress'] },
        startTime: { [Op.gte]: sixMonthsAgo.toDate() }
      },
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('userId')), 'userId'], // Unique trainees
        [sequelize.fn('MONTHNAME', sequelize.col('startTime')), 'month']
      ],
      raw: true
    });

    // Aggregate trainees count by month
    const traineeCountByMonth = months.map(month => {
      const traineeCount = traineeData.filter(data => data.month === month).length;
      return { month, traineeCount };
    });

    res.status(200).json(traineeCountByMonth);
  } catch (error) {
    console.error('Error fetching six-month trainee activity:', error);
    res.status(500).json({ error: 'Error fetching six-month trainee activity.' });
  }
};