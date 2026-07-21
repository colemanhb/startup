import './new_words.css';
import React, { useEffect } from 'react';

const other_dict = {
  maison: {
    definition: "A building for human habitation, especially one that is lived in by a family or small group of people.",  },
  ville: {
    definition: "A large town.",
  },
}

export function Authenticated() {
  const [my_dict, setMyDict] = React.useState({});
  
  useEffect(() => {
    fetch('/api/words')
      .then(response => response.json())
      .then(data => {
        setMyDict(data.words);
      })
      .catch((err) => console.error('Error fetching user words:', err));
  }, []);

  const [wordSet, setWordSet] = React.useState('myWords');
  return (
    <main className="new-words">
      <div className="new-words-controls">
        <button id="my-words" className="btn btn-light" onClick={() => setWordSet('myWords')}>
          My Words
        </button>
        <button id="friends-words" className="btn btn-light" onClick={() => setWordSet('friendsWords')}>
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
        <tbody>
          {wordSet === 'myWords' ? Object.entries(my_dict).map(([word, data]) => (
            <tr key={word}>
              <td>{word}</td>
              <td>{data.definition}</td>
            </tr>
          )) : Object.entries(other_dict).map(([word, data]) => (
            <tr key={word}>
              <td>{word}</td>
              <td>{data.definition}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}