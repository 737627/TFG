import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './Leaderboard.css';

const socket = io('http://localhost:5000');

const Leaderboard = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    // Solicitar datos de clasificación al montar el componente
    socket.emit('requestLeaderboard', roomCode);

    // Manejar la respuesta del servidor con los datos de clasificación
    const handleShowLeaderboard = (leaderboard) => {
      setPlayers(leaderboard);
    };

    socket.on('showLeaderboard', handleShowLeaderboard);

    // Limpiar listener al desmontar
    return () => {
      socket.off('showLeaderboard', handleShowLeaderboard);
    };
  }, [roomCode]);

  // Formatear tiempo de milisegundos a minutos y segundos
  const formatTime = (timeInMillis) => {
    const seconds = Math.floor((timeInMillis / 1000) % 60);
    const minutes = Math.floor((timeInMillis / 1000) / 60);
    return `${minutes} minutos ${seconds} segundos`;
  };

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
            <li key={index}>
              <strong>{index + 1}. {player.name}</strong>: {formatTime(player.totalTime)}
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay datos de clasificación disponibles.</p>
      )}
      <button onClick={goMenuPage} className="home-button">Ir al <menu></menu></button>
    </div>
  );
};

export default Leaderboard;
