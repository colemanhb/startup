import './booklist.css';
import React from 'react';
import { NavLink } from 'react-router-dom';

export function Booklist() {
  return (
    <main className="booklist">
      <h2 id="spanish">Spanish</h2>
      <ul>
        <li>
          <NavLink 
            to="/page" 
            state={{ book: { id: 2000, title: "Don Quixote", author: "Miguel de Cervantes", lang: "es" } }}
          >
            Don Quixote
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/page" 
            state={{ book: { id: 61851, title: "El Crimen y el Castigo", author: "Fyodor Dostoevsky", lang: "es" } }}
          >
            El Crimen y el Castigo
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/page" 
            state={{ book: { id: 55514, title: "Cuentos de Amor", author: "Emilia Pardo Bazán", lang: "es" } }}
          >
            Cuentos de Amor
          </NavLink>
        </li>
      </ul>

      <h2 id="french">French</h2>
      <ul>
        <li>
          <NavLink 
            to="/page" 
            state={{ book: { id: 62215, title: "Le Fantôme de l'Opéra", author: "Gaston Leroux", lang: "fr" } }}
          >
            Le Fantôme de l'Opéra
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/page" 
            state={{ book: { id: 18143, title: "Roméo et Juliette", author: "William Shakespeare", lang: "fr" } }}
          >
            Roméo et Juliette
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/page" 
            state={{ book: { id: 17989, title: "Le Comte de Monte-Cristo", author: "Alexandre Dumas", lang: "fr" } }}
          >
            Le Comte de Monte-Cristo
          </NavLink>
        </li>
      </ul>

      <h2 id="german">German</h2>
      <ul>
        <li>
          <NavLink 
            to="/page" 
            state={{ book: { id: 50285, title: "Dr. Mabuse, der Spieler", author: "Norbert Jacques", lang: "de" } }}
          >
            Dr. Mabuse, der Spieler
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/page" 
            state={{ book: { id: 35312, title: "Aus dem Leben eines Taugenichts", author: "Joseph von Eichendorff", lang: "de" } }}
          >
            Aus dem Leben eines Taugenichts
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/page" 
            state={{ book: { id: 56156, title: "Venus im Pelz", author: "Leopold von Sacher-Masoch", lang: "de" } }}
          >
            Venus im Pelz
          </NavLink>
        </li>
      </ul>

      <h2 id="italian">Italian</h2>
      <ul>
        <li>
          <NavLink 
            to="/page" 
            state={{ book: { id: 1012, title: "La Divina Commedia di Dante", author: "Dante Alighieri", lang: "it" } }}
          >
            La Divina Commedia di Dante
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/page" 
            state={{ book: { id: 38729, title: "L'amore che torna: romanzo", author: "Guido da Verona", lang: "it" } }}
          >
            L'amore che torna: romanzo
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/page" 
            state={{ book: { id: 52484, title: "Le Avventure di Pinocchio", author: "Carlo Collodi", lang: "it" } }}
          >
            Le Avventure di Pinocchio
          </NavLink>
        </li>
      </ul>

      <h2 id="portuguese">Portuguese</h2>
      <ul>
        <li>
          <NavLink 
            to="/page" 
            state={{ book: { id: 40409, title: "Os Maias", author: "Eça de Queirós", lang: "pt" } }}
          >
            Os Maias
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/page" 
            state={{ book: { id: 42942, title: "O Primo Bazilio", author: "Eça de Queirós", lang: "pt" } }}
          >
            O Primo Bazilio
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/page" 
            state={{ book: { id: 24919, title: "Amor Crioulo", author: "Lúcio de Mendonça", lang: "pt" } }}
          >
            Amor Crioulo
          </NavLink>
        </li>
      </ul>
    </main>
  );
}