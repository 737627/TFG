import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { H5P } from 'h5p-standalone';
import io from 'socket.io-client';
import Challenge2Explanation from './explanation'; // Importar el componente de explicación
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Importar FontAwesome para los íconos
import { faFileAlt } from '@fortawesome/free-solid-svg-icons'; // Importar el ícono de documento
import './H5PComponent.css';

const socket = io('http://localhost:5000');

const H5PComponent = ({ h5pFilePath }) => {
    const h5pContainerRef = useRef(null);
    const h5pInstanceRef = useRef(null);
    const navigate = useNavigate();
    const { roomCode } = useParams();
    const [showExplanation, setShowExplanation] = useState(true); // Estado para mostrar la explicación
    const [roomExists, setRoomExists] = useState(true); // Estado para verificar si la sala existe

    useEffect(() => {
        if (roomCode) {
            // Verificar si la sala existe antes de continuar
            socket.emit('checkRoomExists', roomCode, (response) => {
                if (!response.exists) {
                    setRoomExists(false);
                    navigate('/menu'); // Redirigir al menú de desafíos si la sala no existe
                }
            });
        }
    }, [roomCode, navigate]);

    useEffect(() => {
        if (!showExplanation && roomExists && h5pContainerRef.current && h5pFilePath) {
            // Limpiar cualquier instancia anterior
            if (h5pInstanceRef.current) {
                if (typeof h5pInstanceRef.current.detach === 'function') {
                    h5pInstanceRef.current.detach();
                }
                h5pInstanceRef.current = null;
            }

            const options = {
                frameJs: '/h5p/frame.bundle.js',
                frameCss: '/h5p/frame.bundle.css',
                id: 'h5p-container',
                h5pJsonPath: h5pFilePath,
            };

            new H5P(h5pContainerRef.current, options)
                .then(instance => {
                    h5pInstanceRef.current = instance;
                    console.log('H5P content loaded successfully');

                    // Configurar el listener para el externalDispatcher
                    const handleH5PEvent = (event) => {
                        console.log('H5P Event:', event);

                        const statement = event.data?.statement;
                        if (statement && statement.result && statement.result.score) {
                            const { score } = statement.result;
                            console.log(`Score: ${score.raw}/${score.max}`);
                            if (score.raw === score.max) {
                                console.log('Full score achieved, navigating to next challenge...');

                                socket.emit('finishChallenge', {
                                    roomCode: roomCode,
                                    playerId: socket.id,
                                    challengeId: 2
                                });

                                if (roomCode) {
                                    navigate(`/challenge3/${roomCode}`);
                                } else {
                                    navigate('/menu');
                                }
                            }
                        } else {
                            console.log('Event does not contain score information or result:', event);
                        }
                    };

                    if (window.H5P && window.H5P.externalDispatcher) {
                        window.H5P.externalDispatcher.on('xAPI', handleH5PEvent);
                    } else {
                        console.warn('H5P externalDispatcher is not available.');
                    }

                    return () => {
                        if (window.H5P && window.H5P.externalDispatcher) {
                            window.H5P.externalDispatcher.off('xAPI', handleH5PEvent);
                        }
                    };
                })
                .catch(error => {
                    console.error('Error loading H5P content:', error);
                });

            return () => {
                if (h5pInstanceRef.current) {
                    if (typeof h5pInstanceRef.current.detach === 'function') {
                        h5pInstanceRef.current.detach();
                    }
                    h5pInstanceRef.current = null;
                }
            };
        }
    }, [h5pFilePath, navigate, roomCode, showExplanation, roomExists]);

    // Si la sala no existe, mostrar un mensaje indicando redirección
    if (!roomExists) {
        return <div>Sala no encontrada. Redirigiendo...</div>;
    }

    return (
        <div className="h5p-iframe-wrapper">
            {showExplanation ? (
                <Challenge2Explanation onContinue={() => setShowExplanation(false)} />
            ) : (
                <>
                    <div id="h5p-container" ref={h5pContainerRef} className="h5p-frame"></div>
                    {/* Botón de Información TFG */}
                    <button 
                        className="info-tfg-button" 
                        onClick={() => window.open('https://eupt.unizar.es/TFE', '_blank')}
                    >
                        <FontAwesomeIcon icon={faFileAlt} /> Información TFG
                    </button>
                </>
            )}
        </div>
    );
};

export default H5PComponent;
