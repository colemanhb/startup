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
  const [currentPage, setCurrentPage] = useState(0);

  const initialLoadDone = useRef(false);

  useEffect(() => {
    let isMounted = true;
    initialLoadDone.current = false;

    async function loadBookData() {
      setLoading(true);

      try {
        const [text, progressRes] = await Promise.all([
          getText(selectedBook.id),
          fetch(`/api/progress/${selectedBook.id}`)
            .then(res => res.ok ? res.json() : { progress: 0 })
            .catch(() => ({ progress: 0 }))
        ]);

        if (isMounted) {
          const savedPage = Number(progressRes.progress) || 0;
          setRawBookText(text);
          setCurrentPage(savedPage);
          setLoading(false);
          
          setTimeout(() => {
            if (isMounted) initialLoadDone.current = true;
          }, 100);
        }
      } catch (error) {
        console.error('Error loading book text or progress:', error);
        if (isMounted) setLoading(false);
      }
    }

    loadBookData();

    return () => { isMounted = false; };
  }, [selectedBook.id]);

  const pages = useMemo(() => {
    if (!rawBookText) return ["No content available."];
    return paginateText(rawBookText);
  }, [rawBookText]);

  useEffect(() => {
    if (loading || !initialLoadDone.current) return;

    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId: selectedBook.id, page: currentPage })
    }).catch(error => console.error('Error saving progress:', error));

  }, [currentPage, loading, selectedBook.id]);

  const [selectedWord, setSelectedWord] = useState(null);
  const [popupData, setPopupData] = useState(null);
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

    setSelectedWord(cleanWord);
    setPopupData(data);

    try {
      const response = await fetch(`https://freedictionaryapi.com/api/v1/entries/${selectedBook.lang}/${cleanWord}`);
      if (response.ok) {
        const resultData = await response.json();
        const firstEntry = resultData.entries?.[0];
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