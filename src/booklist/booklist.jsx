import React from 'react';

export function Booklist() {
  return (
    <main>
        <h2 id = "spanish">
            Spanish
        </h2>
            <ul>
                <li><a href="page.html">Don Quixote</a></li>
                <li><a href="page.html">El Crimen y el Castigo</a></li>
                <li><a href="page.html">Cuentos de Amor</a></li>
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
    </main>
  );
}