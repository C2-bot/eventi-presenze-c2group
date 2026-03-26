/**
 * Configurazione centrale dell'applicazione Rilevazione Presenze C2 Group.
 *
 * PER AGGIUNGERE UN NUOVO EVENTO:
 * 1. Aggiungi un oggetto in EVENTS qui sotto
 * 2. Aggiungi lo stesso codice+foglio in apps-script/Code.js (oggetto EVENTS)
 * 3. Crea il tab corrispondente nel Google Sheet
 * 4. Commit + push → GitHub Pages si aggiorna in 2-3 min
 */

const CONFIG = {
    // URL del Google Apps Script deployment
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzGtj0YcvXINd1zVcVHGKRrOYjnQbhB_eyek0E3zHztRbxFmKx6udugsDbk--UJRTOS/exec',

    // Timeout sessione in minuti
    SESSION_TIMEOUT_MINUTES: 240,

    // Operatori autorizzati
    USERS: {
        "marketing@c2group.it": "evento123",
        "enrico.demarco@c2group.it": "evento123",
        "michele.mondoni@c2group.it": "evento123",
        "giovanni.ginevra@c2group.it": "evento123",
        "mattia.rossi@c2group.it": "evento123",
        "nicola.roli@c2group.it": "evento123"
    },

    // Configurazione eventi
    // Ogni chiave e' il codice evento usato nell'API.
    // Per aggiungere un evento basta aggiungere un blocco qui.
    EVENTS: {
        "HP": {
            name: "HP | Laboratori Professionali",
            sheetName: "Iscrizioni Evento (HP)",
            emailColumn: "E",
            presenzaColumn: "O",
            active: true
        },
        "CIOFS": {
            name: "CIOFS | Educare all'Intelligenza Artificiale",
            sheetName: "Iscrizioni Evento (CIOFS)",
            emailColumn: "E",
            presenzaColumn: "O",
            active: true
        },
        "IACATANIA": {
            name: "IA Sicilia - Catania",
            sheetName: "Iscrizioni Evento (IA Sicilia - Catania)",
            emailColumn: "E",
            presenzaColumn: "O",
            active: true
        },
        "IAPALERMO": {
            name: "IA Sicilia - Palermo",
            sheetName: "Iscrizioni Evento (IA Sicilia - Palermo)",
            emailColumn: "E",
            presenzaColumn: "O",
            active: true
        }
    }
};
