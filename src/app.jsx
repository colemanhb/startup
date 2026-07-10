import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Languages } from './languages/languages';
import { Page } from './page/page';
import { NewWords } from './new_words/new_words';
import { About } from './about/about';
import { Booklist } from './booklist/booklist';

export default function App() {
  return (
    <BrowserRouter>
        <div className="body bg-light text-dark">
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
                    <li><NavLink to="/">Home</NavLink></li>
                    <li><NavLink to="/languages">Languages</NavLink></li>
                    <li><NavLink to="/page">Continue Reading</NavLink></li>
                    <li><NavLink to="/new-words">New Words</NavLink></li>
                    <li><NavLink to="/about">About</NavLink></li>
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

            <Routes>
                <Route path='/' element={<Login />} exact />
                <Route path='/languages' element={<Languages />} />
                <Route path='/page' element={<Page />} />
                <Route path='/new-words' element={<NewWords />} />
                <Route path='/about' element={<About />} />
                <Route path='/booklist' element={<Booklist />} />
                <Route path='*' element={<NotFound />} />
            </Routes>

            <footer>
                <span className="text-reset">Coleman Hall-Brown</span>
                <div id="don-quixote" className="picture-box"><img height="100px" src="don_quixote.jpg" alt="Don Quixote" /></div>
                <div id="pinocchio" className="picture-box"><img height="100px" src="pinocchio.jpeg" alt="Pinocchio" /></div>
                <div id="le-fantome" className="picture-box"><img height="100px" src="le_fantome.jpg" alt="The Phantom of the Opera" /></div>
                <div id="alquimista" className="picture-box"><img height="100px" src="alquimista.jpg" alt="The Alchemist" /></div>
                <a href="https://github.com/colemanhb/startup/tree/main/libreboox-html">GitHub</a>
            </footer>
        </div>
    </BrowserRouter>
    );
}

function NotFound() {
  return <main className="container-fluid bg-secondary text-center">404: Return to sender. Address unknown.</main>;
}