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
  const [roomExists, setRoomExists] = useState(null); // Estado para verificar si la sala existe

  useEffect(() => {
    if (roomCode) {
      // Verificar si la sala existe
      socket.emit('checkRoomExists', roomCode, (response) => {
        if (response.exists) {
          setRoomExists(true);
          console.log(`Sala ${roomCode} existe.`);
        } else {
          console.warn('La sala no existe, redirigiendo al menú.');
          navigate('/menu');
        }
      });
    } else {
      // Si no hay roomCode, se asume que es modo individual y no se necesita verificación de sala
      setRoomExists(true);
    }
  }, [roomCode, navigate]);

  useEffect(() => {
    const handleGameEndMessage = (event) => {
      // Verificar que el mensaje proviene del mismo origen para evitar problemas de seguridad
      if (event.origin !== window.location.origin) {
        console.warn('Mensaje de origen desconocido:', event.origin);
        return;
      }

      // Verificar si el mensaje indica que el juego terminó inesperadamente
      if (event.data === 'gameError:gameExitedUnexpectedly') {
        console.log('Juego terminó inesperadamente, enviando datos al servidor.');

        // Obtener `persistentId` desde localStorage o el estado
        const persistentId = localStorage.getItem('persistentId') || socket.id;

        // Comprobar si ya se ha emitido finishChallenge
        const hasFinished = localStorage.getItem(`hasFinished-${roomCode}`);
        if (!hasFinished) {
          console.log(`Emitiendo 'finishChallenge' para sala: ${roomCode}, jugador: ${persistentId}`);
          socket.emit('finishChallenge', {
            roomCode: roomCode,
            persistentId: persistentId,
            challengeId: 4 // ID para este desafío
          });
          localStorage.setItem(`hasFinished-${roomCode}`, 'true');
        }

        // Redirigir a la página adecuada dependiendo de si hay roomCode y si existe
        if (roomCode && roomExists) {
          navigate(`/leaderboard/${roomCode}`);
        } else {
          navigate('/challenge4'); // Si no hay roomCode o es modo individual, ir al siguiente desafío
        }
      }
    };

    // Añadir un listener para los mensajes del juego
    window.addEventListener('message', handleGameEndMessage);

    // Limpiar el listener cuando el componente se desmonte
    return () => {
      window.removeEventListener('message', handleGameEndMessage);
    };
  }, [navigate, roomCode, roomExists]);

  // Mostrar un mensaje de carga mientras se verifica la sala
  if (roomCode && roomExists === null) {
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
