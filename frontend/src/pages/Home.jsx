import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const NUM_PARTICLES = 100;

const Home = () => {
    const [particles, setParticles] = useState([]);
    const velocitiesRef = useRef([]);
    const [tags, setTags] = useState([]); 
    const [inputValue, setInputValue] = useState("");

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

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && inputValue.trim() !== "") {
            setTags((prevTags) => [...prevTags, inputValue.trim()]); // Add new tag
            setInputValue(""); // Clear input
        }
    };

    const removeTag = (tagToRemove) => {
        setTags((prevTags) => prevTags.filter((tag) => tag !== tagToRemove));
    };

    const handleButtonClick = () => {
        console.log("Start Chatting button clicked!"); // ✅ Debugging log
    };

    return (
        <div className="home">
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

            <header className="header">
                <h1 className="header__title">Chatter</h1>
            </header>

            <main className="home__content">
                <div className="search-box">
                    <label htmlFor="tags" className="search-box__label">
                        Enter tags to match with similar users:
                    </label>
                    <input
                        id="tags"
                        type="text"
                        className="search-box__input"
                        placeholder="e.g., gaming, tech, sports"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                    />
                    {/* Display locked-in tags */}
                    <div className="tags-container">
                        {tags.map((tag, index) => (
                            <span key={index} className="tag" onClick={() => removeTag(tag)}>
                                {tag} ✖
                            </span>
                        ))}
                    </div>
                </div>
                
                <Link to={``} className="start-button" onClick={ handleButtonClick }>
                    Start Chatting
                </Link>
            </main>
        </div>
    );
};

export default Home;
