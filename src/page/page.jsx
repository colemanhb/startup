import { Prev } from 'react-bootstrap/esm/PageItem';
import './page.css';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { rawBookText } from './don_quixote';
import { useNavigate } from 'react-router-dom';

export function paginateText(text, wordsPerPage = 700) {
  if (!text) return ["No centent available."];

  const words = text.split(/\s+/);
  const pages = [];
  for (let i = 0; i < words.length; i += wordsPerPage) {
    const page = words.slice(i, i + wordsPerPage).join(' ');
    pages.push(page);
  }
  return pages;
}

export function Page() {
  const [userWords, setUserWords] = useState([]);

  useEffect(() => {
    fetch('/api/words')
      .then(response => response.json())
      .then(words => {setUserWords(words);})
      .catch((err) => console.error('Error fetching user words:', err)
    );
  }, []);

  const pages = useMemo(() => paginateText(rawBookText), []);
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem('currentBookProgress');
    return savedPage ? parseInt(savedPage, 10) : 0;
  });
  useEffect(() => {
    localStorage.setItem('currentBookProgress', currentPage);
  }, [currentPage]);

  const [selectedWord, setSelectedWord] = useState(null);
  const [popupData, setPopupData] = useState(null);
  const [popupLocation, setPopupLocation] = useState({ top: 0, left: 0 });
  const dialogRef = useRef(null);
  const navigate = useNavigate();

  async function handleSaveWord() {
    try {
      const response = await fetch('/api/word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: selectedWord, definition: popupData.definition }),
      });
      if (response.ok) {
        const data = await response.json();
        setUserWords(data.words);
      } else if (response.status === 401) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error saving word:', error);
    }
  }

  const handleWordClick = (event, rawWord) => {
    const cleanWord = rawWord.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "").toLowerCase();
    const data = {
      definition: "Definition not found.",
      translatedDefinition: "Definición no encontrada.",
      translation: "Translation not found."
    };
    const rect = event.target.getBoundingClientRect();
    setSelectedWord(cleanWord);
    setPopupData(data);
    setPopupLocation({ 
      top: rect.bottom + window.scrollY + 10,
      left: rect.left + window.scrollX - 50
     });
  };

  const closePopup = () => {
    setSelectedWord(null);
    setPopupData(null);
  }

  const goToNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };
  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };
  return (
    <main className="page">
        <div className="title-author">
          <h4>Don Quixote</h4>
          <h4>Miguel de Cervantes</h4>;
        </div>
        <p>
          {pages[currentPage].split(/\s+/).map((word, index) => (
            <span 
              key={index}
              onClick={(e) => handleWordClick(e, word)}
              style={{ cursor: 'pointer' }}
              className="clickable-word"
            >
              {word}{" "}
            </span>
          ))}
        </p>
        <div className="page-controls">
            <button 
              id="prev-page" 
              className="btn btn-light"
              onClick={goToPrevPage}
              disabled={currentPage === 0}>
              <i className="bi bi-chevron-left"></i>
            </button>
            <span id="page-number">Page {currentPage + 1} of {pages.length}</span>
            <button 
              id="next-page" 
              className="btn btn-light"
              onClick={goToNextPage}
              disabled={currentPage === pages.length - 1}>
              <i className="bi bi-chevron-right"></i>
            </button>
        </div>
        {selectedWord && popupData && (
          <dialog 
            ref={dialogRef}
            open
            id="popup"
          >
              <h3 id="word">{selectedWord}</h3>
              <p id="definition">{popupData.definition}</p>
              <button id="close-popup" className="btn btn-light" onClick={closePopup}>
                Close
              </button>
              <button 
                id="save-word" 
                className="btn btn-light"
                onClick={handleSaveWord}>
                Save Word
              </button>
          </dialog>
        )}
    </main>
  );
}