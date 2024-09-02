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
      callback({ exists: !!room });
    } catch (error) {
      console.error('Error checking if room exists:', error);
      callback({ exists: false });
    }
  });

  // Crear una sala
  socket.on('createRoom', ({ persistentId, playerName }, callback) => {
    const roomCode = Math.random().toString(36).substring(2, 7);
    const newRoom = new Room({
      token: roomCode,
      players: [{
        id: socket.id,
        persistentId: persistentId,
        name: playerName || `Jugador 1`,
        isReady: false
      }],
      maxPlayers: 4,
      state: 'open'
    });

    newRoom.save()
      .then(async () => {
        socket.join(roomCode);
        callback({ roomCode });
        io.emit('availableRooms', await getAvailableRoomsList()); // Actualizar lista de salas disponibles
        console.log(`Room ${roomCode} created and saved to MongoDB`);
      })
      .catch((error) => {
        console.error('Error saving room:', error);
        callback({ message: 'Error al crear la sala.' });
      });
  });

  // Unirse a una sala
  socket.on('joinRoom', async ({ roomCode, persistentId, playerName }, callback) => {
    try {
      const room = await Room.findOne({ token: roomCode });

      if (room) {
        if (room.state !== 'open') {
          callback({ success: false, message: 'El juego ya ha comenzado en esta sala.' });
          return;
        }

        const existingPlayer = room.players.find(player => player.persistentId === persistentId);

        if (!existingPlayer) {
          const newPlayer = {
            id: socket.id,
            persistentId: persistentId,
            name: playerName || `Jugador ${room.players.length + 1}`,
            isReady: false
          };
          room.players.push(newPlayer);
          await room.save();
          socket.join(roomCode);
          io.in(roomCode).emit('playerJoined', room.players);
          callback({ success: true });
        } else {
          // Actualizar el id de socket del jugador existente
          existingPlayer.id = socket.id;
          await room.save();
          socket.join(roomCode);
          io.in(roomCode).emit('playerJoined', room.players);
          callback({ success: true, message: 'Reconectado a la sala.' });
        }

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
  socket.on('playerReady', async ({ roomCode, persistentId }) => {
    try {
      const room = await Room.findOne({ token: roomCode });
      if (room) {
        const player = room.players.find(p => p.persistentId === persistentId);
        if (player) {
          player.isReady = true;
          await room.save();
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
          room.state = 'inProgress';
          await room.save();
          io.in(roomCode).emit('startGame');
          io.emit('availableRooms', await getAvailableRoomsList());
        } else {
          console.log('No todos los jugadores están listos');
        }
      }
    } catch (error) {
      console.error('Error starting game:', error);
    }
  });

  socket.on('finishChallenge', async ({ roomCode, persistentId, challengeId }) => {
    console.log(`Evento 'finishChallenge' recibido para sala: ${roomCode}, jugador: ${persistentId}, desafío: ${challengeId}`);
    if (!persistentId) {
        console.warn('persistentId no válido recibido, no se puede procesar finishChallenge.');
        return;
    }
    try {
        const room = await Room.findOne({ token: roomCode });
        if (room) {
            console.log(`Sala encontrada: ${roomCode}`);
            const player = room.players.find(p => p.persistentId === persistentId);
            if (player) {
                console.log(`Jugador encontrado: ${player.name}`);

                // Solo actualizar la clasificación si es el último desafío
                if (challengeId === 4) {
                    // Añadir el jugador al final de la clasificación si no está ya
                    if (!room.arrivalOrder.includes(player.name)) {
                        room.arrivalOrder.push(player.name);
                        console.log(`Añadiendo jugador ${player.name} a la clasificación.`);
                        await room.save();

                        // Emitir la clasificación actualizada a todos los jugadores en la sala
                        io.in(roomCode).emit('updateLeaderboard', room.arrivalOrder);
                        console.log(`Jugador ${player.name} añadido a la clasificación en sala ${roomCode}. Clasificación actual: ${room.arrivalOrder}`);
                    } else {
                        console.log(`Jugador ${player.name} ya está en la clasificación, no se añadirá de nuevo.`);
                    }
                } else {
                    console.log(`Jugador ${player.name} completó desafío ${challengeId}, no es el último desafío.`);
                }
            } else {
                console.log(`Jugador con ID persistente ${persistentId} no encontrado en la sala ${roomCode}.`);
            }
        } else {
            console.log(`Sala con código ${roomCode} no encontrada.`);
        }
    } catch (error) {
        console.error('Error al finalizar el desafío:', error);
    }
});

// Evento para eliminar la sala
socket.on('deleteRoom', async (roomCode) => {
  console.log(`Solicitud de eliminación recibida para la sala: ${roomCode}`);
  try {
      const room = await Room.findOne({ token: roomCode });
      if (room) {
          await Room.deleteOne({ token: roomCode });
          console.log(`Sala ${roomCode} eliminada exitosamente.`);
          io.in(roomCode).emit('roomDeleted'); // Emitir a todos los clientes que la sala ha sido eliminada
      } else {
          console.log(`Sala ${roomCode} no encontrada para eliminar.`);
      }
  } catch (error) {
      console.error('Error al eliminar la sala:', error);
  }
});

// Evento para manejar solicitud de clasificación
socket.on('requestLeaderboard', async (roomCode) => {
    console.log(`Evento 'requestLeaderboard' recibido para sala: ${roomCode}`);
    try {
        const room = await Room.findOne({ token: roomCode });
        if (room && room.arrivalOrder) {
            // Emitir la lista de jugadores en el orden de llegada
            socket.emit('showLeaderboard', room.arrivalOrder);
            console.log(`Clasificación encontrada: ${room.arrivalOrder}`);
        } else {
            socket.emit('showLeaderboard', []); // Emitir lista vacía si no hay datos
            console.log('No se encontró clasificación.');
        }
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        socket.emit('showLeaderboard', []); // Emitir lista vacía en caso de error
    }
});

  // Manejo de desconexión del cliente
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
            io.emit('availableRooms', await getAvailableRoomsList()); // Actualizar lista de salas disponibles
          } else {
            await room.save();
            io.in(room.token).emit('playerJoined', room.players);
          }
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
