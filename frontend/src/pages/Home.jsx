import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";
import Header from "../components/Header";
import Background from "../components/Background";
// TODO: normalize tag input so uppercase/lowercase doesnt matter
const Home = () => {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      setTags((prevTags) => [...prevTags, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags((prevTags) => prevTags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <Background>
      <Header />
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
          <div className="tags-container">
            {tags.map((tag, index) => (
              <span key={index} className="tag" onClick={() => removeTag(tag)}>
                {tag} ✖
              </span>
            ))}
          </div>
        </div>

        <Link to={`/chat`} className="start-button" 
        onClick={() => localStorage.setItem("tags", JSON.stringify(tags))}>
          Start Chatting
        </Link>
      </main>
    </Background>
  );
};

export default Home;
