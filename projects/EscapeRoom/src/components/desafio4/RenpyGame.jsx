import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import Challenge4Explanation from './Challenge4Explanation'; // Importa el componente de explicación
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Importar FontAwesome para los íconos
import { faFileAlt } from '@fortawesome/free-solid-svg-icons'; // Importar el ícono de documento

const socket = io('http://localhost:5000'); // Ajusta la URL según sea necesario

const RenpyGame = () => {
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const [showExplanation, setShowExplanation] = useState(true); // Estado para mostrar la explicación
  const [roomExists, setRoomExists] = useState(false); // Estado para verificar si la sala existe

  useEffect(() => {
    if (roomCode) {
      // Verificar si la sala existe
      socket.emit('checkRoomExists', roomCode, (response) => {
        if (response.exists) {
          setRoomExists(true);
        } else {
          console.warn('La sala no existe, redirigiendo al menú.');
          navigate('/menu');
        }
      });
    } else {
      // Si no hay roomCode, redirigir al menú directamente
      navigate('/Challenge4');
    }
  }, [roomCode, navigate]);

  useEffect(() => {
    const handleGameEndMessage = (event) => {
      if (event.origin !== window.location.origin) {
        console.warn('Mensaje de origen desconocido:', event.origin);
        return;
      }

      if (event.data === 'gameExitedUnexpectedly' || event.data === 'gameAborted' || event.data === 'gameFinished') {
        console.log('Juego terminado o salida inesperada, enviando datos al servidor.');

        // Calcular el tiempo total desde el inicio del primer desafío
        const startTime = localStorage.getItem('startTime');
        if (startTime) {
          const endTime = Date.now();
          const totalTime = (endTime - startTime) / 1000; // Tiempo total en segundos
          console.log(`Tiempo total: ${totalTime} segundos`);

          // Enviar el tiempo total al servidor
          socket.emit('finishChallenge', {
            roomCode: roomCode,
            playerId: socket.id,
            challengeId: 4, // ID para el desafío final
            totalTime, // Enviar el tiempo total transcurrido
          });
        } else {
          console.warn('No se encontró el tiempo de inicio en localStorage.');
        }

        // Redirigir a la página de clasificación o al menú dependiendo de si hay roomCode
        if (roomCode) {
          navigate(`/leaderboard/${roomCode}`);
        } else {
          navigate('/menu'); // Redirigir al menú si no hay roomCode
        }
      }
    };

    window.addEventListener('message', handleGameEndMessage);

    return () => {
      window.removeEventListener('message', handleGameEndMessage);
    };
  }, [navigate, roomCode]);

  // Mostrar un mensaje de carga mientras se verifica la sala
  if (roomCode && !roomExists) {
    return <div>Cargando...</div>;
  }

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      {showExplanation ? (
        <Challenge4Explanation onContinue={() => setShowExplanation(false)} />
      ) : (
        <>
          <iframe
            src="/renpy/index.html"
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Ren'Py Game"
          />
          {/* Botón de Información TFG */}
          <button 
            className="info-tfg-button" 
            onClick={() => window.open('https://eupt.unizar.es/TFE', '_blank')}
            style={{ marginTop: '20px' }} // Estilo en línea para separación visual
          >
            <FontAwesomeIcon icon={faFileAlt} /> Información TFG
          </button>
        </>
      )}
    </div>
  );
};

export default RenpyGame;
