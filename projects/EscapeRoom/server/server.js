require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Room = require('./models/Room'); // Importa el modelo Room

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Conexión a MongoDB
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((error) => console.error('MongoDB Atlas connection error:', error));

app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

function disconnectAllClients() {
  for (let [id, socket] of io.sockets.sockets) {
    socket.disconnect(true); // Desconecta al cliente
  }
  console.log('Todos los clientes han sido desconectados.');
}

app.post('/disconnect-all', (req, res) => {
  disconnectAllClients();
  res.send('Todos los clientes han sido desconectados.');
});

const challengeRouter = require('./routes/challenges');
app.use('/api/challenges', challengeRouter);

const roomRouter = require('./routes/rooms');
app.use('/api/rooms', roomRouter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Función para obtener lista de salas disponibles
async function getAvailableRoomsList() {
  try {
    const rooms = await Room.find({ state: 'open' });
    return rooms.map(room => ({
      code: room.token,
      players: room.players,
      hasGameStarted: room.state !== 'open'
    }));
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    return [];
  }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Enviar lista de salas disponibles al conectarse
  getAvailableRoomsList().then(roomsList => {
    socket.emit('availableRooms', roomsList);
  });

  // Manejar solicitud de lista de salas disponibles
  socket.on('getAvailableRooms', async () => {
    const roomsList = await getAvailableRoomsList();
    socket.emit('availableRooms', roomsList);
  });
  // Verificar si la sala existe
  socket.on('checkRoomExists', async (roomCode, callback) => {
    try {
      const room = await Room.findOne({ token: roomCode });
      if (room) {
        callback({ exists: true });
      } else {
        callback({ exists: false });
      }
    } catch (error) {
      console.error('Error checking if room exists:', error);
      callback({ exists: false });
    }
  });

  // Crear una sala
  socket.on('createRoom', async () => {
    const roomCode = Math.random().toString(36).substring(2, 7);
    const newRoom = new Room({
      token: roomCode,
      players: [{
        id: socket.id,
        name: `Jugador 1`,
        isReady: false,
        startTime: null,
        endTime: null,
        totalTime: 0
      }],
      maxPlayers: 4,
      state: 'open'
    });

    try {
      await newRoom.save(); // Guarda la sala en MongoDB
      socket.join(roomCode);
      socket.emit('roomCreated', roomCode);
      io.emit('availableRooms', await getAvailableRoomsList()); // Cambiado a availableRooms
      console.log(`Room ${roomCode} created and saved to MongoDB`);
    } catch (error) {
      console.error('Error saving room:', error);
    }
  });

  // Unirse a una sala
  socket.on('joinRoom', async (roomCode, callback) => {
    try {
      const room = await Room.findOne({ token: roomCode });

      if (room) {
        if (room.state !== 'open') {
          callback({ success: false, message: 'El juego ya ha comenzado en esta sala.' });
          return;
        }

        const existingPlayer = room.players.find(player => player.id === socket.id);

        if (!existingPlayer) {
          const newPlayer = {
            id: socket.id,
            name: `Jugador ${room.players.length + 1}`,
            isReady: false,
            totalTime: 0
          };
          room.players.push(newPlayer);
          await room.save(); // Guarda los cambios en MongoDB
          socket.join(roomCode);
          io.in(roomCode).emit('playerJoined', room.players);
          callback({ success: true });
        } else {
          existingPlayer.id = socket.id;
          await room.save();
          io.in(roomCode).emit('playerJoined', room.players);
          callback({ success: true, message: 'Reconectado a la sala.' });
        }

        // Emitir actualización de salas disponibles
        io.emit('availableRooms', await getAvailableRoomsList());

      } else {
        callback({ success: false, message: 'Sala no encontrada' });
      }
    } catch (error) {
      console.error('Error joining room:', error);
      callback({ success: false, message: 'Error al unirse a la sala.' });
    }
  });

  // Marcar jugador como listo
  socket.on('playerReady', async (roomCode) => {
    try {
      const room = await Room.findOne({ token: roomCode });
      if (room) {
        const player = room.players.find(p => p.id === socket.id);
        if (player) {
          player.isReady = true;
          await room.save(); // Actualiza la sala en MongoDB
          io.in(roomCode).emit('playerReadyStatus', room.players);
        }
      }
    } catch (error) {
      console.error('Error updating player ready status:', error);
    }
  });

  // Iniciar juego
  socket.on('startGame', async (roomCode) => {
    try {
      const room = await Room.findOne({ token: roomCode });
      if (room) {
        const allPlayersReady = room.players.every(player => player.isReady);
        if (allPlayersReady) {
          room.startTime = Date.now();
          room.state = 'inProgress';
          await room.save(); // Actualiza la sala en MongoDB
          io.in(roomCode).emit('startGame');
          io.emit('availableRooms', await getAvailableRoomsList()); // Cambiado a availableRooms
        } else {
          console.log('No todos los jugadores están listos');
        }
      }
    } catch (error) {
      console.error('Error starting game:', error);
    }
  });

  // Desconectar cliente
  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.id);
    try {
      const room = await Room.findOne({ 'players.id': socket.id });
      if (room) {
        const playerIndex = room.players.findIndex(player => player.id === socket.id);
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1);
          if (room.players.length === 0) {
            await Room.deleteOne({ token: room.token });
            console.log(`Room ${room.token} deleted as it is empty.`);
          } else {
            await room.save();
            io.in(room.token).emit('playerJoined', room.players);
          }
          io.emit('availableRooms', await getAvailableRoomsList()); // Cambiado a availableRooms
        }
      }
    } catch (error) {
      console.error('Error handling disconnection:', error);
    }
  });
  
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
});
