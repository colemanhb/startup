import './new_words.css';
import React, { useEffect, useState } from 'react';

export function Authenticated() {
  const [userWords, setUserWords] = useState({});
  const [friendsWords, setFriendsWords] = useState({});
  const [loading, setLoading] = useState(true);
  const [wordSet, setWordSet] = useState('myWords');

  useEffect(() => {
    fetch('/api/words')
      .then((response) => response.json())
      .then((data) => {
        setUserWords(data.myWords || {});
        setFriendsWords(data.friendsWords || {});
      })
      .catch((err) => console.error('Error fetching words:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="new-words">
        <p>Loading words...</p>
      </main>
    );
  }

  const renderRows = () => {
    if (wordSet === 'friendsWords') {
      const globalRows = [];

      Object.entries(friendsWords).forEach(([username, wordsDict]) => {
        if (wordsDict && typeof wordsDict === 'object') {
          Object.entries(wordsDict).forEach(([word, def]) => {
            globalRows.push(
              <tr key={`${username}-${word}`}>
                <td>
                  <span className="badge bg-secondary">{username}</span>
                </td>
                <td><strong>{word}</strong></td>
                <td>{typeof def === 'string' ? def : def.definition}</td>
              </tr>
            );
          });
        }
      });

      if (globalRows.length === 0) {
        return (
          <tr>
            <td colSpan="3" className="text-center text-muted">
              No global words saved yet.
            </td>
          </tr>
        );
      }

      return globalRows;
    }

    const myEntries = Object.entries(userWords);

    if (myEntries.length === 0) {
      return (
        <tr>
          <td colSpan="2" className="text-center text-muted">
            You haven't saved any words yet!
          </td>
        </tr>
      );
    }

    return myEntries.map(([word, def]) => (
      <tr key={word}>
        <td><strong>{word}</strong></td>
        <td>{typeof def === 'string' ? def : def.definition}</td>
      </tr>
    ));
  };

  return (
    <main className="new-words">
      <div className="new-words-controls mb-3">
        <button
          id="my-words"
          className={`btn me-2 ${wordSet === 'myWords' ? 'btn-primary' : 'btn-light'}`}
          onClick={() => setWordSet('myWords')}
        >
          My Words
        </button>
        <button
          id="friends-words"
          className={`btn ${wordSet === 'friendsWords' ? 'btn-primary' : 'btn-light'}`}
          onClick={() => setWordSet('friendsWords')}
        >
          Global Words
        </button>
      </div>

      <table className="table table-bordered">
        <thead>
          <tr>
            {/* Show User column only when viewing Global Words */}
            {wordSet === 'friendsWords' && <th>User</th>}
            <th>Word</th>
            <th>Definition</th>
          </tr>
        </thead>
        <tbody>{renderRows()}</tbody>
      </table>
    </main>
  );
}