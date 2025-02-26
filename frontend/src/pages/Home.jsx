import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
    const [tags, setTags] = useState("");

    return (
        <div className="home">
            {/* Header Section */}
            <header className="header">
                <h1 className="header__title">Omegle Clone</h1>
            </header>

            {/* Main Content */}
            <main className="home__content">
                {/* Search Box Section */}
                <div className="search-box">
                    <label htmlFor="tags" className="search-box__label">Enter tags to match with similar users:</label>
                    <input 
                        id="tags"
                        type="text" 
                        className="search-box__input"
                        placeholder="e.g., gaming, tech, sports"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />
                </div>

                {/* Start Chat Button */}
                <Link to="/chat" className="start-button">
                    Start Chatting
                </Link>
            </main>
        </div>
    );
};

export default Home;
