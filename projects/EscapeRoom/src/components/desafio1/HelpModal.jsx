import React from 'react';
import './HelpModal.css'; // Asegúrate de tener estilos para el modal
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileSignature, faLightbulb, faClipboardList, faUpload, faChalkboardTeacher, faCheckDouble, faMicrophone, faMedal } from '@fortawesome/free-solid-svg-icons';

const HelpModal = ({ onClose }) => {
    return (
        <div className="help-modal-overlay">
            <div className="help-modal-content">
                <h2>Pasos para Completar el TFG</h2>
                <ul>
                    <li><span>1.</span> <FontAwesomeIcon icon={faFileSignature} /> Matriculación: Inscríbete en el TFG.</li>
                    <li><span>2.</span> <FontAwesomeIcon icon={faLightbulb} /> Selección del tema: Elige tu tema y tutor.</li>
                    <li><span>3.</span> <FontAwesomeIcon icon={faClipboardList} /> Propuesta del trabajo: Presenta tu propuesta.</li>
                    <li><span>4.</span> <FontAwesomeIcon icon={faChalkboardTeacher} /> Supervisión: Trabaja con tu tutor.</li>
                    <li><span>5.</span> <FontAwesomeIcon icon={faCheckDouble} /> Evaluación preliminar: Obtén la aprobación.</li>
                    <li><span>6.</span> <FontAwesomeIcon icon={faUpload} /> Depósito del trabajo: Sube tu TFG.</li>
                    <li><span>7.</span> <FontAwesomeIcon icon={faMicrophone} /> Defensa pública: Defiende tu trabajo.</li>
                    <li><span>8.</span> <FontAwesomeIcon icon={faMedal} /> Evaluación final: Recibe tu calificación.</li>
                </ul>
                <button onClick={onClose} className="close-button">Cerrar</button>
            </div>
        </div>
    );
};

export default HelpModal;
