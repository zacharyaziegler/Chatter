import "../styles/Header.css";
import { Link } from "react-router-dom";

const Header = () => {

    return (
        <header className="header">
            <h1 className="header__title">
            <Link to="/">Chatter</Link>
            </h1>
        </header>
    );
};

export default Header;