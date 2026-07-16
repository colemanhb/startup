import { Prev } from 'react-bootstrap/esm/PageItem';
import './page.css';
import React, { useState, useMemo, useEffect } from 'react';
import { rawBookText } from './don_quixote';


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
  const pages = useMemo(() => paginateText(rawBookText), []);
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem('currentBookProgress');
    return savedPage ? parseInt(savedPage, 10) : 0;
  });
  useEffect(() => {
    localStorage.setItem('currentBookProgress', currentPage);
  }, [currentPage]);

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
          <h4>Miguel de Cervantes</h4>
        </div>
        <p>
          {pages[currentPage] || "No content available."}
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
        <dialog id="popup">
            <h3 id="word">Libro</h3>
            <p id="definition">Conjunto de hojas de papel manuscritas o impresas que, cosidas o encuadernadas, forman un volumen:</p>
            <p id="translated-definition">A set of handwritten or printed sheets of paper that, when sewn or bound together, form a volume:</p>
            <p id="translation">Book</p>
            <button id="close-popup" className="btn btn-light">Close</button>
            <button id="save-word" className="btn btn-light">Save Word</button>
        </dialog>
    </main>
  );
}