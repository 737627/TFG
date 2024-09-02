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
        question: '¿Qué debe hacer el alumno para entregar la memoria de su TFG?',
        options: [
            'Enviar el TFG por correo electrónico al tutor.',
            'Depositar el TFG en la plataforma DEPOSITA y enviar la solicitud de defensa.', // Correcta
            'Entregar el TFG impreso en la Secretaría de la Facultad.',
        ],
        correctAnswer: 1,
    },
    {
        question: '¿Qué documentos debe aportar el tutor para el depósito?',
        options: [
            'El plan de estudios del alumno.',
            'El documento Autorización del Director debidamente firmado.', // Correcta
            'Las calificaciones del alumno en todas las asignaturas.',
        ],
        correctAnswer: 1,
    },
    {
        question: '¿Qué es lo que tiene que hacer el tribunal?',
        options: [
            'Proporcionar una lista de temas para el TFG.',
            'Organizar los horarios de las clases.',
            'Evaluar el TFG a partir de la memoria y la defensa y emitir una calificación.', // Correcta
        ],
        correctAnswer: 2,
    },
    {
        question: '¿Qué formato debe seguir la memoria del TFG?',
        options: [
            'Cumplir con las normas de presentación establecidas en la normativa de la Escuela.', // Correcta
            'Ser escrito a mano en folios.',
            'Ser presentado en un formato libre elegido por el alumno.',
        ],
        correctAnswer: 0,
    },
    {
        question: '¿Qué debe hacer el alumno para la defensa del TFG?',
        options: [
            'Solo asistir el día de la defensa sin preparación previa.',
            'Preparar una presentación para la defensa pública ante el tribunal evaluador.', // Correcta
            'Enviar una grabación de video en lugar de asistir a la defensa.',
        ],
        correctAnswer: 1,
    },
    {
        question: '¿Qué plazos debe respetar el alumno en el proceso de entrega del TFG?',
        options: [
            'No hay plazos específicos, el alumno puede entregar cuando desee.',
            'Debe respetar el plazo de presentación de la propuesta y esperar a una de las fechas de depósitos públicas en la web de la EUPT.', // Correcta
            'Puede entregar el TFG en cualquier momento antes de graduarse.',
        ],
        correctAnswer: 1,
    },
    {
        question: '¿Cuáles de los siguientes documentos deben adjuntarse junto con la memoria del TFG según la diapositiva?',
        options: [
            'Autorización del Director, Pantalla encuesta egresados, Documento de resguardo.',
            'Correo de confirmación del repositorio, Pantalla encuesta egresados, Declaración de autoría, Documento de resguardo.',
            'Autorización del Director, Correo de confirmación del repositorio, Pantalla encuesta egresados, Declaración de autoría, Documento de resguardo.', // Correcta
        ],
        correctAnswer: 2,
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

    useEffect(() => {
        if (roomCode) {
            socket.emit('checkRoomExists', roomCode, (response) => {
                if (!response.exists) {
                    setRoomExists(false);
                    navigate('/menu'); // Redirigir al menú de desafíos si la sala no existe
                }
            });
        }

        // Asignar un persistentId si no existe
        if (!localStorage.getItem('persistentId')) {
            localStorage.setItem('persistentId', socket.id);
        }
    }, [roomCode, navigate]);

    // Emitir evento al servidor cuando el jugador termine el desafío correctamente
    useEffect(() => {
        if (currentQuestion === questions.length - 1 && isCorrect) {
            // Obtener `persistentId` desde localStorage
            const persistentId = localStorage.getItem('persistentId');
            console.log(`Player has won in room ${roomCode} with persistentId: ${persistentId}. Proceeding to next challenge.`);

            if (persistentId) {
                socket.emit('finishChallenge', {
                    roomCode: roomCode,
                    persistentId: persistentId, // Usar persistentId en lugar de socket.id
                    challengeId: 3, // ID para este desafío
                });
            } else {
                console.error('No se pudo obtener persistentId para emitir finishChallenge.');
            }
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
                const persistentId = localStorage.getItem('persistentId');
                console.log(`Emitiendo 'finishChallenge' para sala: ${roomCode}, jugador: ${persistentId}`);

                if (persistentId) {
                    socket.emit('finishChallenge', {
                        roomCode: roomCode,
                        persistentId: persistentId, // Usar persistentId en lugar de socket.id
                        challengeId: 3,
                    });
                    if (roomCode) {
                        navigate(`/challenge4/${roomCode}`); // Navegar a la siguiente ruta con roomCode
                    } else {
                        navigate('/menu'); // Navegar al menú de desafíos si no hay roomCode
                    }
                } else {
                    console.error('No se pudo obtener persistentId para emitir finishChallenge.');
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