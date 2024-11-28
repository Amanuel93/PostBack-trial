const {TraineeProgress,Answer,Training,Question,User} = require('../models');
const { sendResult } = require('../utils/mailer'); // Nodemailer
const { sendMail } = require('../utils/mailer'); 
const upload = require('../config/multerConfig'); 
const multer = require('multer');
const { Op } = require('sequelize');

// Start training
exports.startTraining = async (req, res) => {
    try {
      const { passcode } = req.body;
      const { trainingId } = req.params;
      const traineeId = req.user.id; // assuming JWT auth
  
      // Find the training by ID
      const training = await Training.findByPk(trainingId);
  
      if (!training) {
        return res.status(404).json({ message: 'Training not found' });
      }
  
      // Check if the passcode is correct
      if (training.passcode !== passcode) {
        return res.status(400).json({ message: 'Incorrect passcode' });
      }
  
      // Check if the trainee has already started the training
      const [progress, created] = await TraineeProgress.findOrCreate({
        where: {
          userId: traineeId,
          trainingId: trainingId,
        },
        defaults: {
          status: 'in-progress',
          // startTime: startTime,
          // endTime: endTime
        }
      });
  
      if (!created && progress.status !== 'in-progress') {
        return res.status(400).json({ message: 'Training has already been completed or expired.' });
      }
      
      return res.status(200).json({
        message: 'Training started successfully',
        progress,
        // startTime,
        // endTime,
      });
    } catch (error) {
      console.error('Error starting training:', error);
      return res.status(500).json({ message: 'Error starting training', error: error.message });
    }
  };

  exports.submitAndEvaluate = async (req, res) => {
    const { trainingId } = req.params;
    const traineeId = req.user.id; // assuming JWT auth
    console.log(traineeId);
    const { answers: submittedAnswers } = req.body;
  
    try {
      // Find the trainee progress for this user and training
      const progress = await TraineeProgress.findOne({
        where: {
          userId: traineeId,
          trainingId: trainingId,
          status: 'in-progress'
        }
      });
  
      if (!progress) {
        return res.status(404).json({ message: 'Training progress not found or already submitted.' });
      }
  
      if (!submittedAnswers || submittedAnswers.length === 0) {
        return res.status(400).json({ message: 'No answers submitted.' });
      }
  
      let correctAnswersCount = 0;
      const totalQuestions = submittedAnswers.length;
  
      // Loop through each submitted answer to evaluate
      for (const submittedAnswer of submittedAnswers) {
        const { questionId, selectedOption } = submittedAnswer;
  
        // Find the corresponding question
        const question = await Question.findByPk(questionId);
  
        if (!question) {
          return res.status(404).json({ message: `Question with ID ${questionId} not found.` });
        }
  
        // Check if the submitted answer is correct
        const isCorrect = question.correctAnswer === selectedOption;
  
        if (isCorrect) {
          correctAnswersCount++;
        }
  
        // Save the answer in the database (if needed)
        await Answer.create({
          userId: traineeId,
          trainingId: trainingId,
          questionId: questionId,
          selectedOption,
          isCorrect
        });
      }
  
      // Calculate the score percentage
      const scorePercentage = (correctAnswersCount / totalQuestions) * 100;
  
      // Update the progress with the calculated score and pass/fail status
      progress.score = scorePercentage;
      progress.status = 'completed';
      progress.pass = scorePercentage >= 70;
      progress.endTime = new Date(); 
  
      // Save the updated progress
      await progress.save();
  
      // Send email notification with the result
      const trainee = await User.findByPk(traineeId);
      const resultMessage = progress.pass
        ? `Congratulations! You passed the training with a score of ${scorePercentage.toFixed(2)}%.`
        : `Unfortunately, you did not pass the training. Your score was ${scorePercentage.toFixed(2)}%.`;
  
      await sendResult(trainee.email, 'Training Evaluation Result', resultMessage);
  
      res.status(200).json({
        message: 'Training submitted and evaluated successfully.',
        score: scorePercentage,
        pass: progress.pass
      });
    } catch (error) {
      console.error('Error submitting and evaluating training:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  };

  exports.planTraining = async (req, res) => {
    try {
      const { plannedDate } = req.body;
      const { trainingId } = req.params;
      const traineeId = req.user.id;
  
      // Find the trainee and training
      const trainee = await User.findByPk(traineeId);
      const training = await Training.findByPk(trainingId);
  
      if (!trainee) {
        return res.status(404).json({ message: 'Trainee not found' });
      }
  
      if (!training) {
        return res.status(404).json({ message: 'Training not found' });
      }
  
      // Check if the planned date is within the training's start and end date
      // const plannedDateObj = new Date(plannedDate);
  
      // Find the trainee's progress for this training
      const progress = await TraineeProgress.findOne({
        where: {
          userId: traineeId,
          trainingId: trainingId,
        },
      });
  
      if (progress) {
        // Check if the training is in progress
        if (progress.status === 'in-progress') {
          return res.status(400).json({ message: 'The training is in progress. You cannot take it again.' });
        }
  
        // Check if the training is completed and the trainee passed
        if (progress.status === 'completed' && progress.pass) {
          return res.status(400).json({ message: 'You have already completed and passed this training.' });
        }
      }
  
      // If no progress or not completed, create or update the progress
      const [updatedProgress, created] = await TraineeProgress.findOrCreate({
        where: {
          userId: traineeId,
          trainingId: trainingId,
        },
        defaults: {
          status: 'planned',
          startTime: plannedDate,
        },
      });
  
      if (!created) {
        // Update the planned date if already enrolled
        updatedProgress.startTime = plannedDate;
        updatedProgress.status = 'planned';
        await updatedProgress.save();
      }
  
      // Notify the trainee
      const message = `Your training for ${training.title} has been planned for ${plannedDate}.`;
      await sendMail(trainee.email, 'Training Planned', message);
  
      res.status(200).json({ message: 'Training successfully planned', progress: updatedProgress });
    } catch (error) {
      console.error('Error in planning training:', error);
      res.status(500).json({ message: 'An error occurred while planning the training', error });
    }
  };

  exports.completeProfile = async (req, res) => {
    upload.single('image')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Multer error during file upload', details: err.message });
    } else if (err) {
      return res.status(400).json({ error: 'Unknown error during file upload', details: err.message });
    }

    try {
      // Assuming trainee's ID is passed in the request params
      const {
        department, position, branch, years_of_experience, experience_detail,bio,birthplace
      } = req.body;
      const file = req.file;
      const userId = req.user.id;

      // Find the trainee user by ID
      const trainee = await User.findOne({ where: { id: userId, role: 'trainee' } });
      if (!trainee) {
        return res.status(404).json({ error: 'Trainee not found.' });
      }

      // Prepare the update payload with only the unfilled attributes
      const updateData = {};

      if (!trainee.department && department) updateData.department = department;
      if (!trainee.position && position) updateData.position = position;
      if (!trainee.branch && branch) updateData.branch = branch;
      if (!trainee.years_of_experience && years_of_experience) updateData.years_of_experience = years_of_experience;
      if (!trainee.experience_detail && experience_detail) updateData.experience_detail = experience_detail;
      if (!trainee.bio && bio) updateData.bio = bio;
      if (!trainee.birthplace && birthplace) updateData.birthplace = birthplace;
      if (!trainee.image && file) updateData.image = file.path; // Only set image if a file is uploaded

      // If there are no fields to update
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'Profile is already complete or no new data provided.' });
      }

      // Update the trainee's profile
      await User.update(updateData, { where: { id: userId } });

      // Check if all required fields are now filled
      const updatedTrainee = await User.findOne({ where: { id: userId } });
      const allFieldsFilled = updatedTrainee.department && updatedTrainee.position &&
                              updatedTrainee.branch && updatedTrainee.years_of_experience && 
                              updatedTrainee.experience_detail && updatedTrainee.image && 
                              updatedTrainee.birthplace && updatedTrainee.bio  ;
                 
        console.log(allFieldsFilled);                      
      // If all fields are filled, set completed to true
      if (allFieldsFilled) {
        await User.update({ completed: true }, { where: { id: userId } });
      }

      res.status(200).json({ message: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Error updating profile.' });
      console.log(error)
    }
  });
};

exports.validateChapterProgress = async (req, res) => {
  const { chapterId } = req.params;
  const { answers } = req.body;

  try {
    // Fetch all questions for the chapter
    const questions = await Question.findAll({ where: { chapterId } });

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for this chapter.' });
    }

    // Validate submitted answers
    const correctAnswers = questions.filter(q =>
      answers.some(a => a.questionId === q.id && a.selectedOption === q.correctAnswer)
    ).length;

    const totalQuestions = questions.length;
    const requiredCorrectAnswers = Math.ceil(totalQuestions / 2);

    // Check if the user met the requirement
    const canProceed = correctAnswers >= requiredCorrectAnswers;

    return res.status(200).json({ canProceed, correctAnswers, requiredCorrectAnswers });
  } catch (error) {
    console.error('Error in validateChapterProgress controller:', {
      message: error.message,
      stack: error.stack,
      controller: 'validateChapterProgress',
      params: req.params,
      body: req.body,
    });
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
};

exports.getMyTrainings = async (req, res) => {
  try {
    const traineeId = req.user?.id;

    const trainings = await TraineeProgress.findAll({
      where: { 
        userId: traineeId ,
        status:"completed"
      }, // Filter by logged-in trainee's ID
      attributes: ['startTime', 'endTime', 'status', 'score'], // Include relevant fields from TraineeProgress
      include: [
        {
          model: Training,
          attributes: ['title'], // Include the name of the training
        },
      ],
    });

    if (!trainings.length) {
      return res.status(404).json({
        success: false,
        message: 'No trainings found for this trainee.',
      });
    }

    // Transform data for response
    const response = trainings.map((training) => ({
      trainingName: training.Training.name, // Training name from the associated Training model
      status: training.status,
      score: training.score,
      startTime: training.startTime,
      endTime: training.endTime,
    }));

    // Send response
    return res.status(200).json({
      success: true,
      message: 'Trainings fetched successfully.',
      data: response,
    });
  } catch (error) {
    console.error('Error fetching trainings:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching trainings.',
      error: error.message,
    });
  }
};