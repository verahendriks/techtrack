// ------------------------------------------------------------------
// Functie: Tijd formatteren
// ------------------------------------------------------------------
// Zet een totaal aantal seconden om naar een leesbare string (bijv. "8u 22m")
export function formatDuration(seconds) {
  // Validatie: geef een standaardwaarde terug bij ongeldige input
  if (!seconds || isNaN(seconds)) {
    return "0u 0m";
  }
  
  const totalSeconds = Number(seconds);

  // Bereken hele uren en de resterende minuten
  const hours = Math.floor(totalSeconds / 3600); // Math.floor rondt af naar beneden
  const minutes = Math.floor((totalSeconds % 3600) / 60); // TotalSeconds % 3600 geeft de resterende seconden die geen heel uur vormen

  return `${hours}u ${minutes}m`;
}

// ------------------------------------------------------------------
// Functie: Datum formatteren
// ------------------------------------------------------------------
// Formatteert een datumstring naar een kort Nederlands formaat (bijv. "do 4 nov")
export function formatDate(dateString) {
  if (!dateString) return "";
  
  const date = new Date(dateString);

  // Controleer of de datum geldig is om crashes te voorkomen
  if (isNaN(date.getTime())) {
    return ""; 
  }

  // Gebruik de ingebouwde formatter voor Nederlandse notatie
  return date.toLocaleDateString("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// ------------------------------------------------------------------
// Functie: Wind omrekenen
// ------------------------------------------------------------------
// Zet windsnelheid (km/h) om naar de schaal van Beaufort (0-12)
export function kmhToBeaufort(kmh) {
// Validatie: Negatieve wind bestaat niet, dus return 0
  if (!kmh || kmh < 1) return 0;
  
  // Checken van laag naar hoog 
  // Zodra een 'if' waar is, stopt de functie door de 'return'
  if (kmh <= 5)   return 1;
  if (kmh <= 11)  return 2;
  if (kmh <= 19)  return 3;
  if (kmh <= 28)  return 4;
  if (kmh <= 38)  return 5;
  if (kmh <= 49)  return 6;
  if (kmh <= 61)  return 7;
  if (kmh <= 74)  return 8;
  if (kmh <= 88)  return 9;
  if (kmh <= 102) return 10;
  if (kmh <= 117) return 11;
  
  return 12;
}