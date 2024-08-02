// 웹소켓 기능
const roomList = {};

module.exports = (room) => {
    room.on('connection', (socket) => {
        console.log('room 네임스페이스에 접속');
        const roomName = socket.handshake.query.room;
        const roomPassword = socket.handshake.query.password;
        console.log(roomPassword);
      
        // roomList에 해당 roomName이 없을 경우에만 새로운 room 추가
        if (!roomList.hasOwnProperty(roomName)) {
          roomList[roomName] = {
            count: 1, // roomName의 사용자 수를 1로 초기화
            password: roomPassword // roomName의 비밀번호를 설정
          };
        } else {
          roomList[roomName].count++; // roomName의 사용자 수 + 1
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
};

module.exports.roomList = roomList;