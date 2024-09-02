import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const CreateRoom = () => {
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState([{ id: 'self', name: 'Jugador 1', isReady: false }]);
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();

  // Generar o recuperar el ID persistente
  const [persistentId, setPersistentId] = useState(
    localStorage.getItem('persistentId') || generateNewId()
  );

  useEffect(() => {
    // Guardar el persistentId en localStorage para futuras sesiones
    localStorage.setItem('persistentId', persistentId);

    // Manejar la creación de la sala
    const handleRoomCreated = (code) => {
      console.log('Sala creada con código:', code);
      setRoomCode(code);
    };

    // Manejar cuando un jugador se une a la sala
    const handlePlayerJoined = (playersList) => {
      console.log('Jugador se unió, lista de jugadores:', playersList);
      if (Array.isArray(playersList)) {
        const updatedPlayers = playersList.map((player, index) => ({
          ...player,
          name: `Jugador ${index + 1}`
        }));
        setPlayers(updatedPlayers);
      } else {
        console.error('Formato de lista de jugadores no válido:', playersList);
      }
    };

    // Manejar la actualización del estado de listo de los jugadores
    const handlePlayerReadyStatus = (updatedPlayersList) => {
      console.log('Lista de jugadores actualizada:', updatedPlayersList);
      if (Array.isArray(updatedPlayersList)) {
        setPlayers(updatedPlayersList);
      } else {
        console.error('Formato de lista de jugadores no válido:', updatedPlayersList);
      }
    };

    // Manejar el inicio del juego
    const handleStartGame = () => {
      navigate(`/challenge1/${roomCode}`);
    };

    // Escuchar eventos de socket
    socket.on('roomCreated', handleRoomCreated);
    socket.on('playerJoined', handlePlayerJoined);
    socket.on('playerReadyStatus', handlePlayerReadyStatus);
    socket.on('startGame', handleStartGame);

    // Limpieza al desmontar el componente
    return () => {
      socket.off('roomCreated', handleRoomCreated);
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('playerReadyStatus', handlePlayerReadyStatus);
      socket.off('startGame', handleStartGame);
    };
  }, [navigate, roomCode, persistentId]);

  const handleCreateRoom = () => {
    socket.emit('createRoom', { persistentId, playerName: 'Jugador 1' }, (response) => {
      if (response && response.roomCode) {
        console.log('Sala creada con éxito:', response.roomCode);
        setRoomCode(response.roomCode);
      } else {
        console.error('Error al crear la sala:', response?.message || 'Unknown error');
      }
    });
  };

  const handleReady = () => {
    setIsReady(true);
    const updatedPlayers = players.map(player =>
      player.id === 'self' ? { ...player, isReady: true } : player
    );
    setPlayers(updatedPlayers);
    socket.emit('playerReady', { roomCode, persistentId });
    console.log('Jugador marcado como listo');
  };

  const startGame = () => {
    console.log('Enviando señal para iniciar el juego.');
    socket.emit('startGame', roomCode);
  };

  const canStartGame = players.length >= 2 && players.every(player => player.isReady);

  return (
    <div className="create-room-container">
      <h1>Crear Sala</h1>
      {roomCode ? (
        <>
          <p>El código de tu sala es: <strong>{roomCode}</strong></p>
          <p>Jugadores en la sala: {players.length}</p>
          {Array.isArray(players) && players.length > 0 ? (
            <ul>
              {players.map((player, index) => (
                <li key={player.persistentId || player.id}>
                  {player.name} - {player.isReady ? 'Listo' : 'No listo'}
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay jugadores en la sala.</p>
          )}
          {!isReady ? (
            <button onClick={handleReady} className="ready-button">Estoy Listo</button>
          ) : (
            <button 
              onClick={startGame} 
              className="start-game-button" 
              disabled={!canStartGame} 
            >
              Empezar Juego
            </button>
          )}
        </>
      ) : (
        <button onClick={handleCreateRoom} className="create-room-button">Crear Sala</button>
      )}
    </div>
  );
};

// Función para generar un nuevo ID persistente
function generateNewId() {
  return 'player-' + Math.random().toString(36).substr(2, 9);
}

export default CreateRoom;
