import './booklist.css';
import React from 'react';

import { NavLink } from 'react-router-dom';

export function Booklist() {
  return (
    <main className="booklist">
        <h2 id = "spanish">
            Spanish
        </h2>
            <ul>
                <li><NavLink to="/page">Don Quixote</NavLink></li>
                <li><NavLink to="/page">El Crimen y el Castigo</NavLink></li>
                <li><NavLink to="/page">Cuentos de Amor</NavLink></li>
            </ul>
        <h2 id = "french">
            French
        </h2>
            <ul>
                <li><NavLink to="/page">Le Fantôme de l'Opéra</NavLink></li>
            </ul>
        <h2 id = "german">
            German
        </h2>
            <ul>
                <li><NavLink to="/page">Dr. Mabuse, der Spieler</NavLink></li>
            </ul>
        <h2 id = "italian">
            Italian
        </h2>
            <ul>
                <li><NavLink to="/page">Le Avventure di Pinocchio</NavLink></li>
            </ul>
        <h2 id = "portuguese">
            Portuguese
        </h2>
        <h2 id = "russian">
            Russian
        </h2>
        <h2 id = "mandarin">
            Mandarin
        </h2>
        <h2 id = "japanese">
            Japanese
        </h2>
        <h2 id = "korean">
            Korean
        </h2>
    </main>
  );
}