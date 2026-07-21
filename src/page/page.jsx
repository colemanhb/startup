import { Prev } from 'react-bootstrap/esm/PageItem';
import './page.css';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export async function getText(bookID = 996) {
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
  const [rawBookText, setRawBookText] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadText() {
      setLoading(true);
      const text = await getText(996);
      setRawBookText(text);
      setLoading(false);
    }
    loadText();
  }, []);

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

  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem('currentBookProgress');
    return savedPage ? parseInt(savedPage, 10) : 0;
  });

  // Automatically adjust currentPage if it's beyond the length of pages array
  useEffect(() => {
    if (currentPage >= pages.length && pages.length > 0) {
      setCurrentPage(0);
    } else {
      localStorage.setItem('currentBookProgress', currentPage);
    }
  }, [currentPage, pages]);

  const [selectedWord, setSelectedWord] = useState(null);
  const [popupData, setPopupData] = useState(null);
  const [popupLocation, setPopupLocation] = useState({ top: 0, left: 0 });
  const dialogRef = useRef(null);
  const navigate = useNavigate();

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
      const response = await fetch(`https://freedictionaryapi.com/api/v1/entries/en/${cleanWord}`);
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

  // Safe page text extraction to avoid split on undefined
  const activePageText = pages[currentPage] || pages[0] || "";

  return (
    <main className="page">
        <div className="title-author">
          <h4>Don Quixote</h4>
          <h4>Miguel de Cervantes</h4>
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