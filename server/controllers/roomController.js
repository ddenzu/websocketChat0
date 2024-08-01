const { roomList } = require('../socket/room.js');

// 방 목록 조회
const getRoomList = (req, res) => {
  try {
    res.status(200).json(roomList);
  } catch (error) {
    console.error('채팅방 오류:', error.message);
    res.status(500).send('서버 에러'); 
  }
};

// 방 비밀번호 확인
const checkPassword = (req, res) => {
  try {
    const { roomName, roomPassword } = req.body;
    if (roomList[roomName] && roomList[roomName].password === roomPassword) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.error('비밀번호 확인 에러:', error.message);
    res.status(500).json({ success: false, error: '서버 에러' });
  }
};

module.exports = {
  getRoomList,
  checkPassword,
};