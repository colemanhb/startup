export const BOOKS = [
  // Spanish
  { id: 2000, title: "Don Quixote", author: "Miguel de Cervantes", lang: "es" },
  { id: 61851, title: "El Crimen y el Castigo", author: "Fyodor Dostoevsky", lang: "es" },
  { id: 55514, title: "Cuentos de Amor", author: "Emilia Pardo Bazán", lang: "es" },

  // French
  { id: 62215, title: "Le Fantôme de l'Opéra", author: "Gaston Leroux", lang: "fr" },
  { id: 18143, title: "Roméo et Juliette", author: "William Shakespeare", lang: "fr" },
  { id: 17989, title: "Le Comte de Monte-Cristo", author: "Alexandre Dumas", lang: "fr" },

  // German
  { id: 50285, title: "Dr. Mabuse, der Spieler", author: "Norbert Jacques", lang: "de" },
  { id: 35312, title: "Aus dem Leben eines Taugenichts", author: "Joseph von Eichendorff", lang: "de" },
  { id: 56156, title: "Venus im Pelz", author: "Leopold von Sacher-Masoch", lang: "de" },

  // Italian
  { id: 1012, title: "La Divina Commedia di Dante", author: "Dante Alighieri", lang: "it" },
  { id: 38729, title: "L'amore che torna: romanzo", author: "Guido da Verona", lang: "it" },
  { id: 52484, title: "Le Avventure di Pinocchio", author: "Carlo Collodi", lang: "it" },

  // Portuguese
  { id: 40409, title: "Os Maias", author: "Eça de Queirós", lang: "pt" },
  { id: 42942, title: "O Primo Bazilio", author: "Eça de Queirós", lang: "pt" },
  { id: 24919, title: "Amor Crioulo", author: "Lúcio de Mendonça", lang: "pt" }
];

export function getBookById(id) {
  const numericId = Number(id);
  return BOOKS.find(b => b.id === numericId) || null;
}