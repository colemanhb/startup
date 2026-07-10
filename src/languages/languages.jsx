import './languages.css';
import React from 'react';

import { NavLink } from 'react-router-dom';

const languages = [
  { name: 'Spanish', id: 'spanish' },
  { name: 'French', id: 'french' },
  { name: 'German', id: 'german' },
  { name: 'Italian', id: 'italian' },
  { name: 'Portuguese', id: 'portuguese' },
  { name: 'Russian', id: 'russian' },
  { name: 'Mandarin', id: 'mandarin' },
  { name: 'Japanese', id: 'japanese' },
  { name: 'Korean', id: 'korean' },
];

export function Languages() {
  return (
    <main className="languages">
      <h2>Choose a language to read in</h2>
      <ul>
        {languages.map((language) => (
          <li key={language.id}>
            <NavLink to={`/booklist#${language.id}`}>
              {language.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </main>
  );
}