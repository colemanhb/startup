import './new_words.css';
import React, { useEffect, useState } from 'react';

const other_dict = {
  maison: {
    definition: "A building for human habitation, especially one that is lived in by a family or small group of people.",
  },
  ville: {
    definition: "A large town.",
  },
};

export function Authenticated() {
  // Initialize state as an empty object or array safely
  const [userWords, setUserWords] = useState([]);
  const [wordSet, setWordSet] = useState('myWords');

  useEffect(() => {
    fetch('/api/words')
      .then((response) => response.json())
      .then((data) => {
        const wordsData = data.words || data || [];
        setUserWords(wordsData);
      })
      .catch((err) => console.error('Error fetching user words:', err));
  }, []);

  const renderRows = () => {
    if (wordSet === 'friendsWords') {
      return Object.entries(other_dict).map(([word, item]) => (
        <tr key={word}>
          <td>{word}</td>
          <td>{item.definition}</td>
        </tr>
      ));
    }

    if (Array.isArray(userWords)) {
      return userWords.map((item, index) => (
        <tr key={item.id || item.word || index}>
          <td>{item.word}</td>
          <td>{item.definition}</td>
        </tr>
      ));
    }

    if (typeof userWords === 'object' && userWords !== null) {
      return Object.entries(userWords).map(([word, item]) => (
        <tr key={word}>
          <td>{word}</td>
          <td>{typeof item === 'string' ? item : item.definition}</td>
        </tr>
      ));
    }

    return null;
  };

  return (
    <main className="new-words">
      <div className="new-words-controls">
        <button
          id="my-words"
          className={`btn ${wordSet === 'myWords' ? 'btn-primary' : 'btn-light'}`}
          onClick={() => setWordSet('myWords')}
        >
          My Words
        </button>
        <button
          id="friends-words"
          className={`btn ${wordSet === 'friendsWords' ? 'btn-primary' : 'btn-light'}`}
          onClick={() => setWordSet('friendsWords')}
        >
          My Friends' Words
        </button>
      </div>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Word</th>
            <th>Definition</th>
          </tr>
        </thead>
        <tbody>{renderRows()}</tbody>
      </table>
    </main>
  );
}