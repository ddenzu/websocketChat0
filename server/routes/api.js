const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

router.get('/data', roomController.getRoomList); // 방 목록 조회
router.post('/checkPassword', roomController.checkPassword); // 방 비밀번호 확인

module.exports = router;