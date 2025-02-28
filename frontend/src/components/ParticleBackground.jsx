
import { useState, useEffect, useRef } from "react";
import "../styles/Particles.css"; 

const NUM_PARTICLES = 100;

const ParticleBackground = () => {
    const [particles, setParticles] = useState([]);
    const velocitiesRef = useRef([]);

    useEffect(() => {
        // Initialize particles with random positions and velocities
        const initialParticles = Array.from({ length: NUM_PARTICLES }).map(() => ({
            id: Math.random(),
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 10 + 3, // Size between 3px - 8px
        }));

        const initialVelocities = initialParticles.map(() => ({
            vx: (Math.random() - 0.5) * 1.5, // Slower speed for smooth effect
            vy: (Math.random() - 0.5) * 1.5,
        }));

        setParticles(initialParticles);
        velocitiesRef.current = initialVelocities;

        const moveParticles = () => {
            setParticles((prevParticles) =>
                prevParticles.map((p, i) => {
                    let newX = p.x + velocitiesRef.current[i].vx;
                    let newY = p.y + velocitiesRef.current[i].vy;

                    // Bounce off left/right walls
                    if (newX <= 0 || newX >= window.innerWidth) {
                        velocitiesRef.current[i].vx *= -1;
                        newX = Math.max(0, Math.min(window.innerWidth, newX));
                    }

                    // Bounce off top/bottom walls
                    if (newY <= 0 || newY >= window.innerHeight) {
                        velocitiesRef.current[i].vy *= -1;
                        newY = Math.max(0, Math.min(window.innerHeight, newY));
                    }

                    return { ...p, x: newX, y: newY };
                })
            );

            requestAnimationFrame(moveParticles);
        };

        moveParticles();
    }, []);

    return (
        <div className="particle-container">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="particle"
                    style={{
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        top: `${particle.y}px`,
                        left: `${particle.x}px`,
                    }}
                ></div>
            ))}
        </div>
    );
};

export default ParticleBackground;
