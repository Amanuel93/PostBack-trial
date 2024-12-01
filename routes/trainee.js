const express = require('express');
const router = express.Router();
const {authenticate} = require('../middlewares/auth')
const traineeController = require('../controllers/traineeController')

router.post('/start-training/:trainingId',authenticate,traineeController.startTraining)
router.post('/submit/:trainingId',authenticate,traineeController.submitAndEvaluate)
router.post('/complete',authenticate,traineeController.completeProfile)
router.post('/track-progress/:chapterId',authenticate,traineeController.validateChapterProgress)
router.post('/plan/:trainingId',authenticate,traineeController.planTraining)
router.get('/getTrainings',authenticate,traineeController.getMyTrainings )

module.exports = router;