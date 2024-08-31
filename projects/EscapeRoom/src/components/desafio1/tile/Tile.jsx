import './Tile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileSignature, faLightbulb, faClipboardList, faUpload, faChalkboardTeacher, faCheckDouble, faMicrophone, faMedal } from '@fortawesome/free-solid-svg-icons';

const icons = {
    1: <FontAwesomeIcon icon={faFileSignature} />, // Matriculación
    2: <FontAwesomeIcon icon={faLightbulb} />,     // Selección del tema
    3: <FontAwesomeIcon icon={faClipboardList} />, // Propuesta del trabajo
    4: <FontAwesomeIcon icon={faChalkboardTeacher} />, // Supervisión
    5: <FontAwesomeIcon icon={faCheckDouble} />,   // Evaluación preliminar
    6: <FontAwesomeIcon icon={faUpload} />,        // Depósito del trabajo
    7: <FontAwesomeIcon icon={faMicrophone} />,    // Defensa pública
    8: <FontAwesomeIcon icon={faMedal} />,         // Evaluación final
};


const Tile = ({ number, moveTile }) => (
    <div 
        onClick={() => moveTile(number)} 
        className={`number ${number.value === number.index + 1 ? 'correct' : ''} ${number.value === 9 ? 'disabled' : ''} slot--${number.index}`}>
        {number.value === 9 ? '' : icons[number.value]} {/* Muestra el icono en lugar del número */}
    </div>
);

export default Tile;
