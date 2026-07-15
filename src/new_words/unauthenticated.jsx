import './new_words.css';
import React from 'react';

export function Unauthenticated() {
  return (
    <main className="new-words">
      <div className="new-words-controls">
        <button id="my-words" className="btn btn-light">My Words</button>
        <button id="friends-words" className="btn btn-light">My Friends' Words</button>
      </div>
      <table className="table table-bordered">
        <thead>
            <tr>
                <th>Word</th>
                <th>Definition</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Libro</td>
                <td>Conjunto de hojas de papel manuscritas o impresas que, cosidas o encuadernadas, forman un volumen. This is not the definition of the word, but I am adding more text to show how the css handles very long definitions.</td>
            </tr>
        </tbody>
      </table>
    </main>
  );
}