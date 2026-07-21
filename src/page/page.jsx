import { Prev } from 'react-bootstrap/esm/PageItem';
import './page.css';
import React, { useState, useMemo, useEffect, useRef } from 'react';

import { useNavigate, useLocation } from 'react-router-dom';

const DEFAULT_BOOK = { 
  id: 2000, 
  title: "Don Quijote", 
  author: "Miguel de Cervantes", 
  lang: "es" 
};

export async function getText(bookID) {
  try {
    const response = await fetch(`/api/gutenberg/${bookID}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch book: ${response.statusText}`);
    }
    const data = await response.json();
    let rawText = data.rawText || data.text || "";
    
    if (!rawText) return "";

    const startMarker = /\*\*\* START OF TH(IS|E) PROJECT GUTENBERG EBOOK .*\*\*\*/i;
    const endMarker = /\*\*\* END OF TH(IS|E) PROJECT GUTENBERG EBOOK .*\*\*\*/i;
    
    const startMatch = rawText.match(startMarker);
    if (startMatch) {
      rawText = rawText.slice(startMatch.index + startMatch[0].length);
    }
    const endMatch = rawText.match(endMarker);
    if (endMatch) {
      rawText = rawText.slice(0, endMatch.index);
    }
    return rawText.trim();
  } catch (error) {
    console.error('Error fetching book text:', error);
    return "";
  }
}

export function paginateText(text, wordsPerPage = 700) {
  if (!text) return ["No content available."];

  const words = text.split(/\s+/);
  const pages = [];
  for (let i = 0; i < words.length; i += wordsPerPage) {
    const page = words.slice(i, i + wordsPerPage).join(' ');
    pages.push(page);
  }
  return pages;
}

export function Page() {
  const navigate = useNavigate();

  const location = useLocation();

  const selectedBook = location.state?.book || DEFAULT_BOOK;

  const [rawBookText, setRawBookText] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem(`progress_${selectedBook.id}`);
    return savedPage ? parseInt(savedPage, 10) : 0;
  });

  // Re-fetch text whenever the book ID changes
  useEffect(() => {
    async function loadText() {
      setLoading(true);
      const text = await getText(selectedBook.id);
      setRawBookText(text);
      setLoading(false);
      
      const savedPage = localStorage.getItem(`progress_${selectedBook.id}`);
      setCurrentPage(savedPage ? parseInt(savedPage, 10) : 0);
    }
    loadText();
  }, [selectedBook.id]);

  const [userWords, setUserWords] = useState([]);

  useEffect(() => {
    fetch('/api/words')
      .then(response => response.json())
      .then(words => { setUserWords(words); })
      .catch((err) => console.error('Error fetching user words:', err));
  }, []);

  const pages = useMemo(() => {
    if (!rawBookText) return ["No content available."];
    return paginateText(rawBookText);
  }, [rawBookText]);

  // Adjust bounds and save book-specific progress
  useEffect(() => {
    if (currentPage >= pages.length && pages.length > 0) {
      setCurrentPage(0);
    } else {
      localStorage.setItem(`progress_${selectedBook.id}`, currentPage);
    }
  }, [currentPage, pages, selectedBook.id]);

  const [selectedWord, setSelectedWord] = useState(null);
  const [popupData, setPopupData] = useState(null);
  const [popupLocation, setPopupLocation] = useState({ top: 0, left: 0 });
  const dialogRef = useRef(null);

  const closePopup = () => {
    setSelectedWord(null);
    setPopupData(null);
  };

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
        closePopup();
      } else if (response.status === 401) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error saving word:', error);
    }
  }

  const handleWordClick = async (event, rawWord) => {
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

    try {
      const response = await fetch(`https://freedictionaryapi.com/api/v1/entries/${selectedBook.lang}/${cleanWord}`);
      if (response.ok) {
        const data = await response.json();
        const firstEntry = data.entries?.[0];
        const firstSense = firstEntry?.senses?.[0];
        const definitionText = firstSense?.definition || "Definition not found.";

        setPopupData({
          definition: definitionText,
          translation: cleanWord
        });
      }
    } catch (err) {
      console.error('Error fetching definition:', err);
    }
  };

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

  if (loading) {
    return <main className="page"><p>Loading book content...</p></main>;
  }

  const activePageText = pages[currentPage] || pages[0] || "";

  return (
    <main className="page">
        <div className="title-author">
          <h4>{selectedBook.title}</h4>
          <h4>{selectedBook.author}</h4>
        </div>
        <p>
          {activePageText.split(/\s+/).map((word, index) => (
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
              <h3 id="word">{selectedWord} ({selectedBook.lang.toUpperCase()})</h3>
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