const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const PORT = 8080;
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // 클라이언트 주소에 맞게 변경
    methods: ['GET', 'POST'] // 요청 허용할 HTTP 메서드
  }
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'build')));
//build 폴더 허용

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const room = io.of('/room');

const roomList = {};

room.on('connection', (socket) => {
  console.log('room 네임스페이스에 접속');
  const roomName = socket.handshake.query.room;
  const roomPassword = socket.handshake.query.password;
  console.log(roomPassword);

  // roomList에 해당 roomName이 없을 경우에만 새로운 room 추가
  if (!roomList.hasOwnProperty(roomName)) {
    roomList[roomName] = {
      count: 1, // 해당 roomName의 사용자 수를 1로 초기화
      password: roomPassword // 해당 roomName의 비밀번호를 저장
    };
  } else {
    roomList[roomName].count++; // 이미 존재하는 roomName의 사용자 수에 1을 더함
  }
  console.log(roomList);

  socket.join(roomName);
  console.log(`${socket.id}이(가) ${roomName}에 조인되었습니다.`);
  socket.broadcast.to(roomName).emit('clientJoined');

  socket.on('message', data => {
    socket.broadcast.to(roomName).emit('message', data);
  });
  
  socket.on('disconnect', () => {
    console.log('room 네임스페이스 접속 해제');
    roomList[roomName].count--;
    if (roomList[roomName].count <= 0) {
      delete roomList[roomName];
    }
    socket.broadcast.to(roomName).emit('leaveRoom'); 
    console.log(roomList);
  });
});

app.get('/data', (req, res) => {
  try {
    res.status(200).json(roomList);
  } catch (error) {
    console.error('채팅방 오류:', error.message);
    res.status(500).send('서버 에러');
  }
});

app.post('/checkPassword', (req, res) => {
  try{
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
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/build/index.html'));
});

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, '/build/index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  })
})