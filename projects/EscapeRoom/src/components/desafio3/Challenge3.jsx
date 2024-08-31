// Challenge3.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import './Challenge3.css';
import Challenge3Explanation from './Challenge3Explanation'; // Importar el componente de explicación
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Importar FontAwesome para los íconos
import { faFileAlt } from '@fortawesome/free-solid-svg-icons'; // Importar el ícono de documento


const socket = io('http://localhost:5000'); // Asegúrate de ajustar la URL según sea necesario

const questions = [
    {
        question: '¿Qué debe hacer el alumno para entregar su TFG?',
        options: [
            'Enviar el TFG por correo electrónico al tutor.',
            'Depositar el TFG en la plataforma DEPOSITA y enviar la solicitud de defensa.', // Correcta
            'Entregar el TFG impreso en la Secretaría de la Facultad.',
        ],
        correctAnswer: 1,
    },
    {
        question: '¿Qué documentos debe revisar y aprobar el tutor?',
        options: [
            'El plan de estudios del alumno.',
            'El informe de evaluación del TFG y aprobarlo para la defensa.', // Correcta
            'Las calificaciones del alumno en todas las asignaturas.',
        ],
        correctAnswer: 1,
    },
    {
        question: '¿Qué es lo que tiene que hacer el tribunal?',
        options: [
            'Proporcionar una lista de temas para el TFG.',
            'Evaluar el TFG durante la defensa y emitir una calificación.', // Correcta
            'Organizar los horarios de las clases.',
        ],
        correctAnswer: 1,
    },
    {
        question: '¿Qué formato debe seguir el TFG para su presentación?',
        options: [
            'Ser escrito a mano en folios.',
            'Cumplir con las normas de presentación establecidas por la facultad.', // Correcta
            'Ser presentado en un formato libre elegido por el alumno.',
        ],
        correctAnswer: 1,
    },
    {
        question: '¿Qué debe hacer el alumno para la defensa del TFG?',
        options: [
            'Solo asistir el día de la defensa sin preparación previa.',
            'Preparar una presentación para la defensa, que puede ser presencial o telemática.', // Correcta
            'Enviar una grabación de video en lugar de asistir a la defensa.',
        ],
        correctAnswer: 1,
    },
    {
        question: '¿Qué plazos debe respetar el alumno en el proceso de entrega del TFG?',
        options: [
            'No hay plazos específicos, el alumno puede entregar cuando desee.',
            'Debe respetar los plazos establecidos para el depósito, solicitud de defensa, y trámites.', // Correcta
            'Puede entregar el TFG en cualquier momento antes de graduarse.',
        ],
        correctAnswer: 1,
    },
    {
        question: '¿Qué puede hacer el tutor si encuentra que el TFG necesita modificaciones antes de su aprobación?',
        options: [
            'Solicitar modificaciones al alumno antes de aprobar el TFG para la defensa.', // Correcta
            'Aprobarlo de todas formas para no retrasar el proceso.',
            'Ignorar los errores y dejar que el tribunal los corrija.',
        ],
        correctAnswer: 0,
    },
];

const Challenge3 = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(false);
    const [showExplanation, setShowExplanation] = useState(true); // Estado para mostrar la explicación
    const [roomExists, setRoomExists] = useState(true); // Estado para verificar si la sala existe
    const navigate = useNavigate(); // Hook para navegación
    const { roomCode } = useParams(); // Obtener roomCode de los parámetros de la URL

    // Verificar si la sala existe antes de permitir avanzar
    useEffect(() => {
        if (roomCode) {
            socket.emit('checkRoomExists', roomCode, (response) => {
                if (!response.exists) {
                    setRoomExists(false);
                    navigate('/menu'); // Redirigir al menú de desafíos si la sala no existe
                }
            });
        }
    }, [roomCode, navigate]);

    // Emitir evento al servidor cuando el jugador termine el desafío correctamente
    useEffect(() => {
        if (currentQuestion === questions.length - 1 && isCorrect) {
            socket.emit('finishChallenge', {
                roomCode: roomCode,
                playerId: socket.id,
                challengeId: 3, // ID para este desafío
            });
        }
    }, [currentQuestion, isCorrect, roomCode]);

    // Manejar cambio de opción seleccionada
    const handleOptionChange = (index) => {
        setSelectedOption(index);
        setIsCorrect(index === questions[currentQuestion].correctAnswer);
    };

    // Manejar avance a la siguiente pregunta
    const handleNextQuestion = () => {
        if (isCorrect) {
            if (currentQuestion < questions.length - 1) {
                setCurrentQuestion((prevQuestion) => prevQuestion + 1);
                setSelectedOption(null);
                setIsCorrect(false);
            } else {
                // Emitir evento de finalización de desafío al servidor
                socket.emit('finishChallenge', {
                    roomCode: roomCode,
                    playerId: socket.id,
                    challengeId: 3,
                });
                if (roomCode) {
                    navigate(`/challenge4/${roomCode}`); // Navegar a la siguiente ruta con roomCode
                } else {
                    navigate('/menu'); // Navegar al menú de desafíos si no hay roomCode
                }
            }
        }
    };

    // Escuchar el evento de proceder al siguiente desafío desde el servidor
    useEffect(() => {
        const proceedToNextChallenge = () => {
            if (roomCode) {
                navigate(`/challenge4/${roomCode}`); // Navegar al siguiente desafío si hay roomCode
            } else {
                navigate('/menu'); // Navegar al menú de desafíos si no hay roomCode
            }
        };

        socket.on('proceedToNextChallenge', proceedToNextChallenge);

        return () => {
            socket.off('proceedToNextChallenge', proceedToNextChallenge);
        };
    }, [navigate, roomCode]);

    // Si la sala no existe, mostrar un mensaje indicando redirección
    if (!roomExists) {
        return <div>Sala no encontrada. Redirigiendo...</div>;
    }

    return (
        <div className="container-wrapper">
            {showExplanation ? (
                <Challenge3Explanation onContinue={() => setShowExplanation(false)} />
            ) : (
                <div className="challenge-container">
                    <h2>{questions[currentQuestion].question}</h2>
                    <ul>
                        {questions[currentQuestion].options.map((option, index) => (
                            <li key={index}>
                                <label>
                                    <input
                                        type="radio"
                                        name="option"
                                        value={index}
                                        checked={selectedOption === index}
                                        onChange={() => handleOptionChange(index)}
                                    />
                                    {option}
                                </label>
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={handleNextQuestion}
                        disabled={!isCorrect}
                    >
                        {currentQuestion < questions.length - 1 ? 'Siguiente' : 'Finalizar'}
                    </button>
                    <p>
                        Pregunta: {currentQuestion + 1} de {questions.length} preguntas
                    </p>
                    {/* Botón de Información TFG */}
                    <button
                        className="info-tfg-button"
                        onClick={() => window.open('https://eupt.unizar.es/TFE', '_blank')}
                    >
                        <FontAwesomeIcon icon={faFileAlt} /> Información TFG
                    </button>
                </div>
            )}
        </div>
    );
};

export default Challenge3;