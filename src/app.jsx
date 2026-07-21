import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './app.css';

import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Page } from './page/page';
import { NewWords } from './new_words/new_words';
import { About } from './about/about';
import { Booklist } from './booklist/booklist';
import { AuthState } from './login/authState';

function App() {
  const [username, setUsername] = useState('');
  const [authState, setAuthState] = React.useState(currentAuthState);
  
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  
  const sidebarRef = React.useRef(null);
  const menuButtonRef = React.useRef(null);
  const settingsPanelRef = React.useRef(null);
  const settingsButtonRef = React.useRef(null);

  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState(1.0);

  const settingsLoaded = useRef(false);

  useEffect(() => {
    async function loadSettings() {
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const data = await response.json();
                if (data.theme) setTheme(data.theme);
                if (data.fontSize) setFontSize(Number(data.fontSize));
            }
        }catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setTimeout(() => {
                settingsLoaded.current = true;
            }, 100);
        }
    }
    loadSettings();
  }, []);

  const increaseFont = () => setFontSize(prevSize => Math.min(prevSize + 0.1, 2.0));
  const decreaseFont = () => setFontSize(prevSize => Math.max(prevSize - 0.1, 1.0));

  useEffect(() => {
    if (!settingsLoaded.current) return;
    fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, fontSize })
    }).catch(error => console.error('Error saving settings:', error))
    
  }, [theme, fontSize]);

  useEffect(() => {
    function handleClickOutside(event) {
        if (
            isSidebarOpen &&
            sidebarRef.current &&
            !sidebarRef.current.contains(event.target) &&
            menuButtonRef.current &&
            !menuButtonRef.current.contains(event.target)
        ) {
            setIsSidebarOpen(false);
        }

        if (
            isSettingsOpen &&
            settingsPanelRef.current &&
            !settingsPanelRef.current.contains(event.target) &&
            settingsButtonRef.current &&
            !settingsButtonRef.current.contains(event.target)
        ) {
            setIsSettingsOpen(false);
        }
    }

    document.addEventListener('click', handleClickOutside);

    return () => {
        document.removeEventListener('click', handleClickOutside);
    };
}, [isSidebarOpen, isSettingsOpen]);

  return (
    <BrowserRouter>
        <div className="body">
            <header>
                <div className="main-buttons">
                    <button 
                        ref={menuButtonRef} 
                        id="menu-button" 
                        className="btn btn-light"
                        onClick={() => {
                            setIsSidebarOpen(!isSidebarOpen);
                            setIsSettingsOpen(false);
                        }}
                    >
                        ☰
                    </button>
                    <button 
                        ref={settingsButtonRef} 
                        id="settings-button" 
                        className="btn btn-light"
                        onClick={() => {
                            setIsSettingsOpen(!isSettingsOpen);
                            setIsSidebarOpen(false);
                        }}
                    >
                    <i className="bi bi-gear"></i>
                    </button> 
                </div>
                <nav 
                    ref={sidebarRef}
                    id="sidebar" 
                    className={isSidebarOpen ? 'open' : ''}
                >
                    <h2>LibreBoox</h2>
                    <menu>
                    <li><NavLink to="/">Home</NavLink></li>
                    <li><NavLink to="/booklist">Books</NavLink></li>
                    <li><NavLink to="/page">Continue Reading</NavLink></li>
                    <li><NavLink to="/new-words">New Words</NavLink></li>
                    <li><NavLink to="/about">About</NavLink></li>
                    </menu>
                </nav>
                <aside 
                    ref={settingsPanelRef}
                    id="settings-panel" 
                    className={isSettingsOpen ? 'open' : ''}
                >
                    <div className="theme-buttons">
                        <button 
                            id="light-theme" 
                            className="btn btn-light"
                            onClick={() => setTheme('light')}
                        >
                            <i className="bi bi-square"></i>
                        </button>
                        <button 
                            id="dark-theme" 
                            className="btn btn-light"
                            onClick={() => setTheme('dark')}
                        >
                            <i className="bi bi-square-fill"></i>
                        </button>
                    </div>
                    <div className="font-size-buttons">
                        <button 
                            id="increase-font" 
                            className="btn btn-light" 
                            onClick={increaseFont}
                        >
                            <i className="bi bi-zoom-in"></i>
                        </button>
                        <button 
                            id="decrease-font" 
                            className="btn btn-light" 
                            onClick={decreaseFont}
                        >
                            <i className="bi bi-zoom-out"></i>
                        </button>
                    </div>
                </aside>
                <hr />
            </header>

            <Routes>
                <Route 
                    path='/' 
                    element={
                        <Login
                            username={username}
                            authState={authState}
                            onAuthChange={(username, authstate) => {
                                setUsername(username);
                                setAuthState(authstate);
                            }}
                        />} 
                        exact 
                />
                <Route path='/page' element={<Page />} />
                <Route 
                    path='/new-words' 
                    element={
                        <NewWords 
                            username={username}
                            authState={authState}
                        />} 
                />
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

export default App;