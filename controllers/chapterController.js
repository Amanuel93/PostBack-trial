const { Training, Chapter, Question } = require('../models'); // Import Sequelize models
const upload = require('../config/multerConfig'); // Multer for file uploads
const multer = require('multer');

exports.createChapter = async (req, res) => {
  upload.single('readingMaterial')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Multer error during file upload', details: err.message });
    } else if (err) {
      return res.status(400).json({ error: 'Unknown error during file upload', details: err.message });
    }

    try {
      const { title, chapterNumber } = req.body;
      const { trainingId } = req.params;
      const { file } = req;

      if (!file) {
        return res.status(400).json({ error: 'No reading material uploaded.' });
      }

      const training = await Training.findByPk(trainingId);
      if (!training) {
        return res.status(404).json({ error: 'Training not found.' });
      }

      const chapter = await Chapter.create({
        title,
        chapterNumber,
        trainingId,
        readingMaterial: file.path,
      });

      res.status(201).json(chapter);
    } catch (error) {
      console.error('Error while saving chapter:', error);
      res.status(400).json({ error: 'File upload failed. Please try again.', details: error.message });
    }
  });
};

  // Update Chapter
exports.updateChapter = async (req, res) => {
  upload.single('readingMaterial')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Multer error during file upload', details: err.message });
    } else if (err) {
      return res.status(400).json({ error: 'Unknown error during file upload', details: err.message });
    }

    try {
      const { id } = req.params;
      const { title, chapterNumber } = req.body;
      const { file } = req;

      // Find the chapter by ID
      const chapter = await Chapter.findByPk(id);
      if (!chapter) {
        return res.status(404).json({ error: 'Chapter not found.' });
      }

      // Update chapter details
      chapter.title = title || chapter.title;
      chapter.chapterNumber = chapterNumber || chapter.chapterNumber;

      // If a new reading material file is uploaded, update it
      if (file) {
        chapter.readingMaterial = file.path;
      }

      await chapter.save(); // Save the updated chapter

      res.status(200).json({ message: 'Chapter updated successfully', chapter });
    } catch (error) {
      console.error('Error while updating chapter:', error);
      res.status(500).json({ error: 'Error updating chapter.', details: error.message });
    }
  });
};
  
  // Get Chapter with All Contents (Training + Questions)
  exports.getChapterWithContents = async (req, res) => {
    try {
      const { id } = req.params;
  
      const chapter = await Chapter.findByPk(id, {
        include: [
          { model: Question, attributes: ['id','questionText', 'type', 'options', 'correctAnswer'] }
        ]
      });
  
      if (!chapter) {
        return res.status(404).json({ error: 'Chapter not found.' });
      }
  
      // Ensure options is parsed as JSON
      const chapterData = chapter.toJSON();
      chapterData.Questions = chapterData.Questions.map(question => {
        if (typeof question.options === 'string') {
          question.options = JSON.parse(question.options);
        }
        return question;
      });
  
      res.status(200).json(chapterData);
    } catch (error) {
      console.error('Error fetching chapter:', error);
      res.status(500).json({ error: 'Error fetching chapter.' });
    }
  };
  
  // Delete Chapter
  exports.deleteChapter = async (req, res) => {
    try {
      const { id } = req.params;
      await Chapter.destroy({ where: { id } });
      res.status(200).send({ message: 'Chapter deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting chapter.' });
    }
  };

  // Get All Chapters for a Given Training
exports.getChaptersByTraining = async (req, res) => {
  try {
    const { trainingId } = req.params;

    // Check if the training exists
    const training = await Training.findByPk(trainingId);
    if (!training) {
      return res.status(404).json({ error: 'Training not found.' });
    }

    // Fetch all chapters associated with the given training
    const chapters = await Chapter.findAll({
      where: { trainingId },
      attributes: ['id', 'title', 'chapterNumber', 'readingMaterial'], // Specify attributes you want to include
    });

    // Check if there are any chapters
    if (chapters.length === 0) {
      return res.status(404).json({ error: 'No chapters found for this training.' });
    }

    res.status(200).json({ trainingId, chapters });
  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({ error: 'Error fetching chapters.', details: error.message });
  }
};

  