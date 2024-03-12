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

const room = io.of('/room');

const roomList = {};

room.on('connection', (socket) => {
  console.log('room 네임스페이스에 접속');
  const roomName = socket.handshake.query.room;
  // roomList에 해당 roomName이 없을 경우에만 새로운 room 추가
  if (!roomList.hasOwnProperty(roomName)) {
    roomList[roomName] = 1; // 해당 roomName의 value를 1로 초기화
  } else {
    roomList[roomName]++; // 이미 존재하는 roomName의 value에 1을 더함
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
    roomList[roomName]--;
    if (roomList[roomName] <= 0) {
      delete roomList[roomName];
    }
    socket.broadcast.to(roomName).emit('leaveRoom'); 
    console.log(roomList);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.get('/data', (req, res) => {
  console.log(roomList)
  try {
    res.status(200).json(roomList);
  } catch (error) {
    console.error('Error sending roomList:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/build/index.html'));
});