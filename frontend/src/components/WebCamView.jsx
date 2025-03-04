import { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import PropTypes from "prop-types";
import "../styles/WebCamView.css";

const WebcamView = ({ isLocal, videoStream, mirrored = false }) => {
    const webcamRef = useRef(null);
    const videoRef = useRef(null);
    const [isWebcamAvailable, setIsWebcamAvailable] = useState(true);

    useEffect(() => {
        if (!isLocal && videoStream && videoRef.current) {
            videoRef.current.srcObject = videoStream;
        }
    }, [videoStream, isLocal]);

    useEffect(() => {
        if (isLocal) {
            navigator.mediaDevices
                .getUserMedia({ video: true })
                .then(() => setIsWebcamAvailable(true))
                .catch(() => setIsWebcamAvailable(false));
        }
    }, [isLocal]);

    return (
        <div className="webcam-container">
            {isLocal ? (
                isWebcamAvailable ? (
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        mirrored={mirrored}
                        className="webcam-feed"
                    />
                ) : (
                    <div className="webcam-placeholder">Webcam Unavailable</div>
                )
            ) : (
                <video ref={videoRef} autoPlay playsInline className="webcam-feed"></video>
            )}
        </div>
    );
};

export default WebcamView;

WebcamView.propTypes = {
    isLocal: PropTypes.node.isRequired,
    videoStream: PropTypes.node.isRequired, 
    mirrored: PropTypes.node.isRequired, 
};
