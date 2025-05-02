// import ParticleBackground from "./ParticleBackground";
import PropTypes from "prop-types";
import "../styles/Background.css";

const Background = ({ children }) => {
    return (
        <div className="solid-background">
            {/* <ParticleBackground />  */}
            {children} 
        </div>
    );
};

Background.propTypes = {
    children: PropTypes.node.isRequired, 
};

export default Background;
