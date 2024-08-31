import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const JoinRoom = () => {
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [roomJoined, setRoomJoined] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Solicitar lista de habitaciones disponibles al conectar
    socket.on('connect', () => {
      socket.emit('getAvailableRooms');
    });

    // Manejar actualización de lista de habitaciones
    const handleAvailableRooms = (roomsList) => {
      setAvailableRooms(roomsList);
      console.log('Habitaciones disponibles:', roomsList);
    };

    const handlePlayerJoined = (playersList) => {
      if (Array.isArray(playersList)) {
        setPlayers(playersList);
        setRoomJoined(true);
      } else {
        console.error('Formato de lista de jugadores no válido:', playersList);
      }
    };

    const handlePlayerReadyStatus = (updatedPlayersList) => {
      if (Array.isArray(updatedPlayersList)) {
        setPlayers(updatedPlayersList);
      } else {
        console.error('Formato de lista de jugadores no válido:', updatedPlayersList);
      }
    };

    const handleStartGame = () => {
      navigate(`/challenge1/${roomCode}`);
    };

    // Escuchar eventos de socket
    socket.on('availableRooms', handleAvailableRooms);
    socket.on('playerJoined', handlePlayerJoined);
    socket.on('playerReadyStatus', handlePlayerReadyStatus);
    socket.on('startGame', handleStartGame);

    // Limpieza al desmontar el componente
    return () => {
      socket.off('availableRooms', handleAvailableRooms);
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('playerReadyStatus', handlePlayerReadyStatus);
      socket.off('startGame', handleStartGame);
    };
  }, [navigate, roomCode]);

  const handleJoinRoom = (code) => {
    const joinCode = code || roomCode;
    if (joinCode) {
      setRoomCode(joinCode);
      socket.emit('joinRoom', joinCode, (response) => {
        if (response.success) {
          setRoomJoined(true);
        } else {
          alert(response.message); // Mostrar un mensaje si el juego ya ha comenzado
          console.error('Error al unirse a la sala:', response.message);
        }
      });
    } else {
      console.warn('El código de la sala está vacío');
    }
  };

  const handleReady = () => {
    setIsReady(true);
    if (roomCode) {
      socket.emit('playerReady', roomCode);
      console.log('Jugador marcado como listo en la sala:', roomCode);
    } else {
      console.error('No se puede marcar como listo, no hay código de sala establecido.');
    }
  };

  // Nueva función para actualizar la lista de salas disponibles
  const handleRefreshRooms = () => {
    socket.emit('getAvailableRooms');
  };

  return (
    <div className="join-room-container">
      <h1>Unirse a Sala</h1>
      {!roomJoined ? (
        <>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="Ingresa el código de la sala"
            className="input-field"
          />
          <button onClick={() => handleJoinRoom()} className="join-room-button">Unirse a la Sala</button>
          <h2>Salas Disponibles</h2>
          {availableRooms.length > 0 ? (
            <ul>
              {availableRooms.map((room) => (
                <li key={room.code}>
                  Código de Sala: {room.code} - Jugadores: {room.players.length}/4
                  {room.hasGameStarted ? (
                    <span> - Juego en marcha</span>
                  ) : (
                    <button onClick={() => handleJoinRoom(room.code)} className="join-room-button">Unirse</button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay salas disponibles en este momento.</p>
          )}
          {/* Botón para actualizar la lista de salas */}
          <button onClick={handleRefreshRooms} className="refresh-button">Actualizar Página</button>
        </>
      ) : (
        <>
          <p>Jugadores en la sala: {players.length}</p>
          {Array.isArray(players) && players.length > 0 ? (
            <ul>
              {players.map((player) => (
                <li key={player.id}>
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
            <p>Esperando a que el líder de la sala quiera comenzar...</p>
          )}
        </>
      )}
    </div>
  );
};

export default JoinRoom;
