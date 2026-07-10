import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

export default function App() {
  return <div className="body bg-dark text-light">
            <header>
                <div className="main-buttons">
                    <button id="menu-button" className="btn btn-light">☰</button>
                    <button id="settings-button" className="btn btn-light">
                    <i className="bi bi-gear"></i>
                    </button> 
                </div>
                <nav id="sidebar" className="open">
                    <h2>LibreBoox</h2>
                    <menu>
                    <li><a href="index.html">Home</a></li>
                    <li><a href="languages.html">Languages</a></li>
                    <li><a href="page.html">Continue Reading</a></li>
                    <li><a href="new_words.html">New Words</a></li>
                    <li><a href="about.html">About</a></li>
                    </menu>
                </nav>
                <aside id="settings-panel" className="open">
                    <div className="theme-buttons">
                    <button id="light-theme" className="btn btn-light">
                        <i className="bi bi-square"></i>
                    </button>
                    <button id="dark-theme" className="btn btn-light">
                        <i className="bi bi-square-fill"></i>
                    </button>
                    </div>
                </aside>
                <hr />
            </header>

            <main>
                App components go here.
            </main>

            <footer>
                <span className="text-reset">Coleman Hall-Brown</span>
                <div id="don-quixote" className="picture-box"><img height="100px" src="don_quixote.jpg" alt="Don Quixote" /></div>
                <div id="pinocchio" className="picture-box"><img height="100px" src="pinocchio.jpeg" alt="Pinocchio" /></div>
                <div id="le-fantome" className="picture-box"><img height="100px" src="le_fantome.jpg" alt="The Phantom of the Opera" /></div>
                <div id="alquimista" className="picture-box"><img height="100px" src="alquimista.jpg" alt="The Alchemist" /></div>
                <a href="https://github.com/colemanhb/startup/tree/main/libreboox-html">GitHub</a>
            </footer>
        </div>;
}