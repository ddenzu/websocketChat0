const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');

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

const room = io.of('/room');
// let roomList = []; // room 이름을 저장할 배열

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

  socket.on('message', data => {
    room.to(roomName).emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log('room 네임스페이스 접속 해제');
    roomList[roomName]--;
    if (roomList[roomName] <= 0) {
      // 만약 value가 0 이하이면 해당 roomName을 roomList에서 삭제
      delete roomList[roomName];
    }
    console.log(roomList);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.get('/data', (req, res) => {
  console.log(roomList)
  try {
    // 클라이언트에게 roomList 데이터를 응답으로 보냄
    res.status(200).json(roomList);
  } catch (error) {
    console.error('Error sending roomList:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/', (req, res) => {
  res.redirect('http://localhost:3000/');
  // res.redirect('http://116.38.253.38:3000/login');
});

// app.get("*", function(req, res){
//   res.sendFile(path.join(__dirname, '/chat/build/index.html'))
// });
