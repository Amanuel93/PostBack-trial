const { Training, Chapter } = require('../models'); // Import Sequelize models
const { Op } = require('sequelize');

// Create Training
exports.createTraining = async (req, res) => {
  try {
    const { title, description,department,position, passcode, startDate, endDate, duration } = req.body;

    if (!title || !passcode || !startDate || !endDate || !duration) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const training = await Training.create({
      title,
      description,
      department,
      position,
      passcode,
      startDate,
      endDate,
      duration  // Store total minutes
    });

    res.status(201).json(training);
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log(error)
  }
};

// Get All Trainings
exports.getAllTrainings = async (req, res) => {
  try {
    const trainings = await Training.findAll({
      include: { model: Chapter }
    });
    res.status(200).json(trainings);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching trainings.' });
    console.log(error)
  }
};

exports.getTrainingById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find a single training by its ID, including the associated chapters
    const training = await Training.findOne({
      where: { id },
      include: { model: Chapter}
    });

    if (!training) {
      return res.status(404).json({ message: 'Training not found.' });
    }

    

    res.status(200).json(training);
  } catch (error) {
    console.error('Error fetching training:', error);
    res.status(500).json({ error: 'Error fetching training.' });
  }
};

// Update Training
exports.updateTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description,department,position, passcode, startDate, endDate, duration } = req.body;

    const updatedTraining = await Training.update({
      title,
      description,
      department,
      position,
      passcode,
      startDate,
      endDate,
      duration,
    }, { where: { id }, returning: true });

    if (updatedTraining[0] === 0) return res.status(404).json({ error: 'Training not found.' });

    res.status(200).json(updatedTraining);
  } catch (error) {
    res.status(400).json({ error: 'Error updating training.' });
  }
};

// Delete Training
exports.deleteTraining = async (req, res) => {
  try {
    const { id } = req.params;
    await Training.destroy({ where: { id } });
    res.status(200).send({ message: 'Training successfully deleted!' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting training.' });
  }
};