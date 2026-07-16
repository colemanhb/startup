import './new_words.css';
import React from 'react';

const my_dict = {
  libro: {
    definition: "A set of handwritten or printed sheets of paper that, when sewn or bound together, form a volume.",
    translatedDefinition: "Conjunto de hojas de papel manuscritas o impresas que, cosidas o encuadernadas, forman un volumen.",
    translation: "Book"
  },
  lugar: {
    definition: "A particular position or point in space.",
    translatedDefinition: "Una posición o punto particular en el espacio.",
    translation: "Place"
  },
}

const other_dict = {
  maison: {
    definition: "A building for human habitation, especially one that is lived in by a family or small group of people.",
    translatedDefinition: "Un edificio para la habitación humana, especialmente uno en el que vive una familia o un pequeño grupo de personas.",
    translation: "House"
  },
  ville: {
    definition: "A large town.",
    translatedDefinition: "Una ciudad grande.",
    translation: "City"
  },
}

export function Authenticated() {
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
                <th>Translation</th>
                <th>Definition</th>
            </tr>
        </thead>
        <tbody>
          {wordSet === 'myWords' ? Object.entries(my_dict).map(([word, data]) => (
            <tr key={word}>
              <td>{word}</td>
              <td>{data.translation}</td>
              <td>{data.definition}</td>
            </tr>
          )) : Object.entries(other_dict).map(([word, data]) => (
            <tr key={word}>
              <td>{word}</td>
              <td>{data.translation}</td>
              <td>{data.definition}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}