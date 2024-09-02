const express = require('express');
const router = express.Router();
const upload2 = require('../middleware/upload2');
const editController = require('../controllers/editController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/edit',upload2.single('image'),editController.boardPic);
router.post('/getBoardImage', editController.getBoardImage);
router.post('/EditeUserBoxes',editController.EditeUserBoxes);
router.get('/getUserBoxes',editController.getUserBoxes);
router.post('/addMessages',editController.addMessages);
router.get('/getUserMessages',editController.getUserMessages);
router.post('/saveMainBackground',editController.saveMainBackground);
router.get('/getUserMainBackgroundColor',editController.getUserMainBackgroundColor);
router.post('/saveTemplate', editController.saveTemplate);
router.get('/getTemplate',editController.getTemplate);
router.post('/saveApi',editController.saveApi);
router.get('/getApi',editController.getApi);
router.post('/notifyTVAppUpdate',editController.notifyTVAppUpdate);
router.get('/checkForUpdates',editController.checkForUpdates);
router.post('/logoutFromTv',editController.logoutFromTv);
router.post('/IslogedoutFromTv',editController.checkTvLogged)

module.exports = router;