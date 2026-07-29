import './booklist.css';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { BOOKS } from '../data/books';

export function Booklist() {
  const getBooksByLang = (lang) => BOOKS.filter(b => b.lang === lang);

  return (
    <main className="booklist">
      <h2 id="spanish">Spanish</h2>
      <ul>
        {getBooksByLang('es').map(book => (
          <li key={book.id}>
            <NavLink to="/page" state={{ book }}>{book.title}</NavLink>
          </li>
        ))}
      </ul>

      <h2 id="french">French</h2>
      <ul>
        {getBooksByLang('fr').map(book => (
          <li key={book.id}>
            <NavLink to="/page" state={{ book }}>{book.title}</NavLink>
          </li>
        ))}
      </ul>

      <h2 id="german">German</h2>
      <ul>
        {getBooksByLang('de').map(book => (
          <li key={book.id}>
            <NavLink to="/page" state={{ book }}>{book.title}</NavLink>
          </li>
        ))}
      </ul>

      <h2 id="italian">Italian</h2>
      <ul>
        {getBooksByLang('it').map(book => (
          <li key={book.id}>
            <NavLink to="/page" state={{ book }}>{book.title}</NavLink>
          </li>
        ))}
      </ul>

      <h2 id="portuguese">Portuguese</h2>
      <ul>
        {getBooksByLang('pt').map(book => (
          <li key={book.id}>
            <NavLink to="/page" state={{ book }}>{book.title}</NavLink>
          </li>
        ))}
      </ul>
    </main>
  );
}