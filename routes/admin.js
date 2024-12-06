const express = require('express');
const router = express.Router();
const {authenticate,authAdmin,authSuperAdmin} = require('../middlewares/auth')
const adminController = require('../controllers/adminController')
const trainingController = require('../controllers/trainingController')
const chapterController = require('../controllers/chapterController')
const questionController = require('../controllers/questionController')
const superadminController = require('../controllers/superadminController')

// Custom middleware to handle middleware composition
const composeMiddleware = (middlewares) => {
    return (req, res, next) => {
      let index = 0;
  
      const runNextMiddleware = () => {
        if (index < middlewares.length) {
          const middleware = middlewares[index++];
          middleware(req, res, runNextMiddleware);
        } else {
          next();
        }
      };

      runNextMiddleware();
    };
  };

//create Training
router.post('/create',composeMiddleware([authenticate,authAdmin]),trainingController.createTraining)
router.get('/getAllTraining',composeMiddleware([authenticate]),trainingController.getAllTrainings)
router.get('/getTraining/:id',composeMiddleware([authenticate]),trainingController.getTrainingById)
router.put('/update/:id',composeMiddleware([authenticate,authAdmin]),trainingController.updateTraining)
router.delete('/delete/:id',composeMiddleware([authenticate,authAdmin]),trainingController.deleteTraining)

//create Chapter
router.post('/createChapter/:trainingId',composeMiddleware([authenticate,authAdmin]),chapterController.createChapter);
router.get('/getChapter/:id',composeMiddleware([authenticate]),chapterController.getChapterWithContents);
router.get('/getAllChapter/:trainingId',composeMiddleware([authenticate]),chapterController.getChaptersByTraining);
router.put('/updateChapter/:id',composeMiddleware([authenticate,authAdmin]),chapterController.updateChapter);
router.delete('/deleteChapter/:id',composeMiddleware([authenticate,authAdmin]),chapterController.deleteChapter);

//create Question
router.post('/createQuestions/:chapterId/:trainingId',composeMiddleware([authenticate,authAdmin]),questionController.createQuestions);
router.put('/updateQuestion/:id',composeMiddleware([authenticate,authAdmin]),questionController.updateQuestion);
router.delete('/deleteQuestion/:id',composeMiddleware([authenticate,authAdmin]),questionController.deleteQuestion);

//getting trainees and statistics analysis
router.get('/getTraineeInfo/:traineeId',composeMiddleware([authenticate,authAdmin]),adminController.getTraineeInfo);
router.get('/statistics',composeMiddleware([authenticate,authAdmin]),adminController.getSystemSummary);
router.get('/pass-fail-summary',composeMiddleware([authenticate,authAdmin]),adminController.getPassFailSummary );
router.get('/six-month-analysis',composeMiddleware([authenticate,authAdmin]),adminController.getSixMonthActivity );
router.get('/getAll-trainee',composeMiddleware([authenticate,authAdmin]),adminController.getAllTrainees);
router.get('/getTrainee/:id',composeMiddleware([authenticate,authAdmin]),adminController.getTraineeById);
router.get('/getPlannedTraining',composeMiddleware([authenticate,authAdmin]),adminController.getPlannedTrainings);

//create Admin for Super-admins
router.post('/create-admin',composeMiddleware([authenticate,authSuperAdmin ]),superadminController.createAdmin);
router.get('/getAll-admins',composeMiddleware([authenticate,authSuperAdmin ]),superadminController.getAdmins);
router.delete('/delete-admin/:id',composeMiddleware([authenticate,authSuperAdmin ]),superadminController.deleteAdmin);

module.exports = router;