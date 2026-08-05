import './page.css';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getBookById } from '../data/books';
import { WordEvent, WordNotifierInstance } from '../wordNotifier';

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

export function Page({ username }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [rawBookText, setRawBookText] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const initialLoadDone = useRef(false);

  const [selectedBook, setSelectedBook] = useState(location.state?.book || null);
  const [loadingBook, setLoadingBook] = useState(!location.state?.book);

  useEffect(() => {
    if (location.state?.book) {
      return;
    }

    let isMounted = true;

    async function fetchLastBook() {
      try {
        const res = await fetch('/api/lastBook');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.lastBookId) {
            const lastBook = getBookById(data.lastBookId);
            if (lastBook) {
              setSelectedBook(lastBook);
              return;
            } 
          }
        }
      } catch (error) {
        console.error('Error fetching last book:', error);
      }

      if (isMounted) {
        setSelectedBook(DEFAULT_BOOK);
      }
    }

    fetchLastBook().finally(() => {
      if (isMounted) {
        setLoadingBook(false);
      }
    });
    
    return () => { isMounted = false; };
  }, [location.state?.book]);

  useEffect(() => {
    if (!selectedBook?.id) return;
    let isMounted = true;
    initialLoadDone.current = false;

    async function loadBookData() {
      setLoading(true);

      try {
        const [text, progressRes] = await Promise.all([
          getText(selectedBook.id),
          fetch(`/api/progress/${selectedBook.id}`)
            .then(res => res.ok ? res.json() : { progress: 0 })
            .catch(() => ({ progress: 0 })),
          fetch(`/api/lastBook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookId: selectedBook.id })
          }).catch(error => console.error('Failed to save last book:', error))
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
  }, [selectedBook?.id]);

  const pages = useMemo(() => {
    if (!rawBookText) return ["No content available."];
    return paginateText(rawBookText);
  }, [rawBookText]);

  useEffect(() => {
    if (loading || !initialLoadDone.current || !selectedBook?.id) return;

    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId: selectedBook.id, page: currentPage })
    }).catch(error => console.error('Error saving progress:', error));

  }, [currentPage, loading, selectedBook?.id]);

  const [selectedWord, setSelectedWord] = useState(null);
  const [popupData, setPopupData] = useState(null);
  const [popupStyle, setPopupStyle] = useState({ display: 'none' });
  const popupRef = useRef(null);

  const closePopup = () => {
    setSelectedWord(null);
    setPopupData(null);
    setPopupStyle({ display: 'none' });
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

        WordNotifierInstance.broadcastEvent(
          data.username, 
          WordEvent.WordSaved, 
          { word: selectedWord, definition: popupData.definition }
        );
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
    
    // Calculate targeted position based on clicked word bounds
    const rect = event.currentTarget.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    const viewportWidth = window.innerWidth;

    const popupWidth = Math.min(280, viewportWidth - 32); // Max width constrained for mobile
    const popupHeight = 180; // Estimated height
    const margin = 16; // Edge padding gap

    // Center above clicked word
    let left = rect.left + scrollX + (rect.width / 2) - (popupWidth / 2);
    let top = rect.top + scrollY - popupHeight - 8;

    // Flip below if clicked word is near top edge of screen
    if (rect.top - popupHeight - margin < 0) {
      top = rect.bottom + scrollY + 8;
    }

    // Clamp horizontally within screen viewport margins
    const minLeft = scrollX + margin;
    const maxLeft = scrollX + viewportWidth - popupWidth - margin;
    left = Math.max(minLeft, Math.min(left, maxLeft));

    setPopupStyle({
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
      width: `${popupWidth}px`,
      zIndex: 1050,
    });

    const data = {
      definition: "Definition not found.",
      translatedDefinition: "Definición no encontrada.",
      translation: "Translation not found."
    };

    setSelectedWord(cleanWord);
    setPopupData(data);

    try {
      const lang = selectedBook?.lang || 'es';
      const response = await fetch(`https://freedictionaryapi.com/api/v1/entries/${lang}/${cleanWord}`);
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

  if (loadingBook || loading || !selectedBook) {
    return <main className="page"><p>Loading book content...</p></main>;
  }

  const activePageText = pages[currentPage] || pages[0] || "";

  return (
    <main className="page" style={{ position: 'relative' }}>
      <div className="title-author">
        <h4>{selectedBook?.title}</h4>
        <h4>{selectedBook?.author}</h4>
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
        <div 
          ref={popupRef}
          id="popup"
          className="card shadow-lg p-3"
          style={popupStyle}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 id="word" className="m-0 fw-bold">{selectedWord} ({selectedBook?.lang?.toUpperCase()})</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={closePopup}
              aria-label="Close"
            ></button>
          </div>
          <p id="definition" className="small text-muted mb-3">{popupData.definition}</p>
          <div className="d-flex gap-2">
            <button 
              id="save-word" 
              className="btn btn-primary btn-sm w-100"
              onClick={handleSaveWord}>
              Save Word
            </button>
          </div>
        </div>
      )}
    </main>
  );
}