import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './Leaderboard.css';

const socket = io('http://localhost:5000');

const Leaderboard = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);

  useEffect(() => {
    // Obtener el persistentId del jugador actual
    const persistentId = localStorage.getItem('persistentId');
    setCurrentPlayerId(persistentId);

    // Verificar si la sala existe
    socket.emit('checkRoomExists', roomCode, (response) => {
      if (!response.exists) {
        console.log('La sala no existe, redirigiendo al menú.');
        navigate('/menu'); // Redirigir al menú si la sala no existe
      } else {
        // Solicitar datos de clasificación si la sala existe
        socket.emit('requestLeaderboard', roomCode);
        console.log(`Solicitando clasificación para sala: ${roomCode}`);
      }
    });

    // Manejar la respuesta del servidor con los datos de clasificación
    const handleShowLeaderboard = (leaderboard) => {
      console.log('Clasificación recibida:', leaderboard);
      setPlayers(leaderboard); // leaderboard debe ser un array de strings
    };

    const handleRoomDeleted = () => {
      console.log('La sala ha sido eliminada, redirigiendo al menú.');
      navigate('/menu'); // Redirigir al menú si la sala ha sido eliminada
    };

    socket.on('showLeaderboard', handleShowLeaderboard);
    socket.on('updateLeaderboard', handleShowLeaderboard); // Manejar también updateLeaderboard
    socket.on('roomDeleted', handleRoomDeleted); // Manejar cuando la sala se elimina

    // Limpiar listeners al desmontar
    return () => {
      socket.off('showLeaderboard', handleShowLeaderboard);
      socket.off('updateLeaderboard', handleShowLeaderboard);
      socket.off('roomDeleted', handleRoomDeleted);
    };
  }, [roomCode, navigate]);

  // Navegar a la página inicial
  const goMenuPage = () => {
    navigate('/menu');
  };

  return (
    <div className="leaderboard-container">
      <h2>Clasificación</h2>
      {players.length > 0 ? (
        <ul className="leaderboard-list">
          {players.map((player, index) => (
            <li key={index} className={player === currentPlayerId ? 'current-player' : ''}>
              <strong>{index + 1}. {player}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay datos de clasificación disponibles.</p>
      )}
      <button onClick={goMenuPage} className="back-button">Ir al Menú</button>
    </div>
  );
};

export default Leaderboard;
