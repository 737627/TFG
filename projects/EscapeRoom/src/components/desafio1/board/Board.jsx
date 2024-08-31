import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './Board.css';
import Tile from "../tile/Tile";
import Overlay from "../overlay/Overlay";
import NewGame from "../new-game/NewGame";
import Winner from "../winner/Winner";
import Explanation from "../explanation"; // Importar el componente de explicación
import HelpModal from "../HelpModal"; // Importar el nuevo componente de ayuda
import io from 'socket.io-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faFileAlt } from '@fortawesome/free-solid-svg-icons'; // Importar los íconos necesarios

const socket = io('http://localhost:5000');

const Board = () => {
    const { roomCode } = useParams();
    const navigate = useNavigate();

    const shuffle = () =>
        new Array(9)
            .fill()
            .map((_, i) => i + 1)
            .sort(() => Math.random() - 0.5)
            .map((x, i) => ({ value: x, index: i }));

    const [numbers, setNumbers] = useState([]);
    const [animating, setAnimating] = useState(false);
    const [hasWon, setHasWon] = useState(false);
    const [showSkipButton, setShowSkipButton] = useState(false);
    const [showExplanation, setShowExplanation] = useState(true); // Estado para mostrar la explicación
    const [showHelp, setShowHelp] = useState(false); // Estado para mostrar la ayuda
    const [roomExists, setRoomExists] = useState(true); // Nuevo estado para verificar si la sala existe

    const reset = () => setNumbers(shuffle());

    useEffect(() => {
        if (roomCode) {
            // Emitir un evento para verificar si la sala existe
            socket.emit('checkRoomExists', roomCode, (response) => {
                if (!response.exists) {
                    setRoomExists(false); // La sala no existe
                    navigate('/menu'); // Redirigir al menú de desafíos
                }
            });
        }

        reset(); // Inicializa el tablero al cargar

        // Registrar el tiempo de inicio si no se ha registrado aún
        if (!localStorage.getItem('startTime')) {
            localStorage.setItem('startTime', Date.now());
        }

        // Limpiar el socket al desmontar
        return () => {
            socket.off('proceedToNextChallenge');
        };
    }, [roomCode, navigate]);

    const moveTile = tile => {
        const i9 = numbers.find(n => n.value === 9).index;
        if (![i9 - 1, i9 + 1, i9 - 3, i9 + 3].includes(tile.index) || animating)
            return;

        const newNumbers = [...numbers].map(number => {
            if (number.index !== i9 && number.index !== tile.index)
                return number;
            else if (number.value === 9)
                return { value: 9, index: tile.index };

            return { value: tile.value, index: i9 };
        });

        setAnimating(true);
        setNumbers(newNumbers);
        setTimeout(() => setAnimating(false), 200);
    };

    const handleKeyDown = e => {
        const i9 = numbers.find(n => n.value === 9).index;
        if (e.keyCode === 37 && !(i9 % 3 === 2))
            moveTile(numbers.find(n => n.index === i9 + 1));
        else if (e.keyCode === 38 && !(i9 > 5))
            moveTile(numbers.find(n => n.index === i9 + 3));
        else if (e.keyCode === 39 && !(i9 % 3 === 0))
            moveTile(numbers.find(n => n.index === i9 - 1));
        else if (e.keyCode === 40 && !(i9 < 3))
            moveTile(numbers.find(n => n.index === i9 - 3));
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [numbers]);

    // Verificar condición de victoria
    useEffect(() => {
        if (numbers.length > 0 && numbers.every((n) => n.index === n.value - 1)) {
            setHasWon(true);

            if (roomCode) {
                console.log(`Player has won in room ${roomCode}! Proceeding to next challenge.`);
                socket.emit('finishChallenge', {
                    roomCode,
                    playerId: socket.id,
                    challengeId: 1
                });
            } else {
                console.log('Player has won in individual mode! Returning to challenge menu.');
                navigate('/menu'); // Redirigir al menú de desafíos
            }
        }
    }, [numbers, roomCode, navigate]);

    // Escuchar el evento de proceder al siguiente desafío
    useEffect(() => {
        socket.on('proceedToNextChallenge', () => {
            console.log("Proceeding to the next challenge");
            navigate(`/challenge2/${roomCode}`); // Redirigir a la ruta correcta del siguiente desafío
        });

        // Limpiar el socket al desmontar
        return () => {
            socket.off('proceedToNextChallenge');
        };
    }, [navigate, roomCode]);

    // Mostrar el botón de saltar desafío después de 2 minutos
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSkipButton(true);
        }, 120000); // 120000 ms = 2 minutos

        return () => clearTimeout(timer); // Limpiar el temporizador en desmontaje
    }, []);

    const handleSkipChallenge = () => {
        if (roomCode) {
            socket.emit('skipChallenge', roomCode); // Emitir evento de saltar desafío si hay roomCode
        } else {
            navigate('/menu'); // Redirigir al menú si no hay roomCode
        }
    };

    // Función para ordenar los números en orden correcto menos uno para testear la condición de casi victoria
    const handleAlmostWinTest = () => {
        const almostWinningNumbers = new Array(9)
            .fill()
            .map((_, i) => ({ value: i + 1, index: i }));

        // Mover el número 9 (vacío) a la penúltima posición y el 8 a la última posición
        almostWinningNumbers[7] = { value: 9, index: 7 }; // Número 9 (vacío) en penúltima posición
        almostWinningNumbers[8] = { value: 8, index: 8 }; // Número 8 en la última posición

        setNumbers(almostWinningNumbers);
    };

    // Si la sala no existe, mostrar mensaje y redirigir
    if (!roomExists) {
        return <div>Sala no encontrada. Redirigiendo...</div>;
    }

    return (
        <div className="game">
            {showHelp && (
                <HelpModal onClose={() => setShowHelp(false)} />
            )}
            {showExplanation ? (
                <Explanation onContinue={() => setShowExplanation(false)} />
            ) : hasWon ? (
                <Winner roomCode={roomCode} socket={socket} />
            ) : (
                <div className="board">
                    <Overlay size={9} />
                    {numbers.map((x, i) => (
                        <Tile key={i} number={x} moveTile={moveTile} />
                    ))}
                </div>
            )}
            {showSkipButton && !showExplanation && (
                <button onClick={handleSkipChallenge} className="skip-challenge-button">
                    Saltar Desafío
                </button>
            )}
            {!showExplanation && <NewGame reset={reset} />}
            {!showExplanation && (
                <button onClick={handleAlmostWinTest} className="test-win-button">
                    Casi Ganar Juego
                </button>
            )}
            {/* Botón de ayuda existente */}
            <button className="help-button" onClick={() => setShowHelp(true)}>
                <FontAwesomeIcon icon={faInfoCircle} /> {/* Icono de información */}
            </button>
            {/* Nuevo botón de Información TFG */}
            <button className="info-tfg-button" onClick={() => window.open("https://eupt.unizar.es/TFE", '_blank')}>
                <FontAwesomeIcon icon={faFileAlt} /> Información TFG
            </button>
        </div>
    );
};

export default Board;
