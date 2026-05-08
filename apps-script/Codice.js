/**
 * ============================================
 * GOOGLE APPS SCRIPT - PRESENZE MULTI-EVENTO
 * Sistema C2 Group per Gestione Eventi Multipli
 * ============================================
 * 
 * COME AGGIUNGERE UN NUOVO EVENTO:
 * 1. Crea un nuovo foglio nel Google Sheet (es: "Iscrizioni Evento (NomeEvento)")
 * 2. Aggiungi la configurazione nell'oggetto EVENTS qui sotto
 * 3. Salva e il nuovo evento apparirà automaticamente nel dropdown della WebApp!
 * 
 * COME RIMUOVERE UN EVENTO:
 * 1. Commenta o elimina la riga dell'evento in EVENTS
 * 2. Salva
 */

// ========== CONFIGURAZIONE SHEET ==========
const SHEET_ID = "1uynwi1RFZRENxHDvvTc0vyOwmsE4hfUb3hexMlUBXdw";
const HEADER_ROW = 1;
// ==========================================

// ========== CONFIGURAZIONE EVENTI ==========
// Aggiungi qui i tuoi eventi!
const EVENTS = {
  "HP": {
    name: "HP | Laboratori Professionali",
    sheetName: "Iscrizioni Evento (HP)",
    emailColumn: "E",
    presenzaColumn: "O"
  },
  "CIOFS": {
    name: "CIOFS | Educare all'Intelligenza Artificiale",
    sheetName: "Iscrizioni Evento (CIOFS)",
    emailColumn: "E",
    presenzaColumn: "O"
  },
  "IACATANIA": {
    name: "IA SICILIA | Edizione Catania",
    sheetName: "Iscrizioni Evento (IA Sicilia - Catania)",
    emailColumn: "E",
    presenzaColumn: "O"
  },
  "IAPALERMO": {
    name: "IA SICILIA | Edizione Palermo",
    sheetName: "Iscrizioni Evento (IA Sicilia - Palermo)",
    emailColumn: "E",
    presenzaColumn: "O"
  },
  "ELPASSISI": {
    name: "ELP - IT ADMIN | ASSISI",
    sheetName: "Iscrizioni Evento (ELP - Assisi)",
    emailColumn: "E",
    presenzaColumn: "O"
  }
  // AGGIUNGI NUOVI EVENTI QUI:
  // "CODICE_EVENTO": {
  //   name: "Nome Completo Evento",
  //   sheetName: "Iscrizioni Evento (NomeEvento)",
  //   emailColumn: "E",
  //   presenzaColumn: "O"
  // }
};
// ==========================================


/**
 * Gestisce le richieste POST dalla WebApp
 */
function doPost(e) {
  try {
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return createResponse(false, "Errore nel parsing dei dati", null);
    }
    
    const email = data.email;
    const eventCode = data.event;
    const operator = data.operator;
    
    // Validazione
    if (!email || !isValidEmail(email)) {
      return createResponse(false, "Email non valida o mancante", null);
    }
    
    if (!eventCode || !EVENTS[eventCode]) {
      return createResponse(false, "Evento non valido", null);
    }
    
    // Registra la presenza
    const result = registraPresenza(email.toLowerCase().trim(), eventCode);
    
    return createResponse(result.success, result.message, result.data);
    
  } catch (error) {
    Logger.log("Errore in doPost: " + error.toString());
    return createResponse(false, "Errore server: " + error.toString(), null);
  }
}


/**
 * Gestisce le richieste GET (per test e recupero configurazione)
 */
function doGet(e) {
  const action = e.parameter.action;
  
  // Ritorna la lista degli eventi disponibili
  if (action === "getEvents") {
    const eventsList = {};
    for (const code in EVENTS) {
      eventsList[code] = EVENTS[code].name;
    }
    return ContentService
      .createTextOutput(JSON.stringify({ events: eventsList }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Test registrazione
  const email = e.parameter.email;
  const eventCode = e.parameter.event;
  
  if (!email || !eventCode) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "Parametri mancanti. Usa: ?email=test@example.com&event=HP"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const result = registraPresenza(email.toLowerCase().trim(), eventCode);
  return createResponse(result.success, result.message, result.data);
}


/**
 * Registra la presenza nel Google Sheet
 */
function registraPresenza(email, eventCode) {
  try {
    const eventConfig = EVENTS[eventCode];
    
    if (!eventConfig) {
      return {
        success: false,
        message: "Evento non trovato: " + eventCode,
        data: null
      };
    }
    
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(eventConfig.sheetName);
    
    if (!sheet) {
      return {
        success: false,
        message: "Foglio '" + eventConfig.sheetName + "' non trovato",
        data: null
      };
    }
    
    // Ottieni tutti i dati della colonna email
    const emailColumnData = sheet.getRange(
      eventConfig.emailColumn + (HEADER_ROW + 1) + ":" + eventConfig.emailColumn
    ).getValues();
    
    // Cerca l'email
    let rowIndex = -1;
    for (let i = 0; i < emailColumnData.length; i++) {
      if (emailColumnData[i][0] && 
          emailColumnData[i][0].toString().toLowerCase().trim() === email) {
        rowIndex = i + HEADER_ROW + 1;
        break;
      }
    }
    
    // Email non trovata
    if (rowIndex === -1) {
      return {
        success: false,
        message: "Email " + email + " non trovata nella lista degli iscritti per l'evento " + eventConfig.name,
        data: { email: email, event: eventCode, found: false }
      };
    }
    
    // Verifica se già registrato
    const presenzaCell = sheet.getRange(eventConfig.presenzaColumn + rowIndex);
    const currentValue = presenzaCell.getValue();
    
    if (currentValue && currentValue.toString().toUpperCase() === "SI") {
      return {
        success: false,
        message: "Attenzione: " + email + " risulta già registrato come presente per " + eventConfig.name,
        data: { 
          email: email,
          event: eventCode,
          found: true, 
          alreadyRegistered: true,
          row: rowIndex 
        }
      };
    }
    
    // REGISTRA SOLO "SI" - NESSUN TIMESTAMP
    presenzaCell.setValue("SI");
    
    Logger.log("Presenza registrata: " + email + " - Evento: " + eventCode + " - Riga: " + rowIndex);
    
    return {
      success: true,
      message: "Presenza registrata con successo per " + email + " all'evento " + eventConfig.name,
      data: { 
        email: email,
        event: eventCode,
        eventName: eventConfig.name,
        found: true, 
        registered: true,
        row: rowIndex,
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (error) {
    Logger.log("Errore in registraPresenza: " + error.toString());
    return {
      success: false,
      message: "Errore durante la registrazione: " + error.toString(),
      data: null
    };
  }
}


/**
 * Crea una risposta JSON standardizzata
 */
function createResponse(success, message, data) {
  const response = {
    success: success,
    message: message,
    data: data,
    timestamp: new Date().toISOString()
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}


/**
 * Valida il formato dell'email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


/**
 * Funzione di test - Esegui questa per verificare che tutto funzioni
 */
function testRegistraPresenza() {
  // MODIFICA CON UN'EMAIL PRESENTE NEL TUO GOOGLE SHEET
  const emailTest = "nicola.roli@c2group.it";
  const eventTest = "HP"; // o "CIOFS"
  
  const result = registraPresenza(emailTest, eventTest);
  Logger.log(JSON.stringify(result, null, 2));
  
  if (result.success) {
    Logger.log("✅ TEST SUPERATO - La presenza è stata registrata correttamente!");
  } else {
    Logger.log("❌ TEST FALLITO - " + result.message);
  }
}


/**
 * Funzione per resettare tutte le presenze di un evento
 */
function resetPresenzeEvento(eventCode) {
  const eventConfig = EVENTS[eventCode];
  
  if (!eventConfig) {
    Logger.log("Evento non trovato: " + eventCode);
    return;
  }
  
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(eventConfig.sheetName);
  
  if (!sheet) {
    Logger.log("Foglio non trovato!");
    return;
  }
  
  const lastRow = sheet.getLastRow();
  const rangePresente = sheet.getRange(
    eventConfig.presenzaColumn + (HEADER_ROW + 1) + ":" + 
    eventConfig.presenzaColumn + lastRow
  );
  rangePresente.clearContent();
  
  Logger.log("✅ Tutte le presenze per " + eventConfig.name + " sono state resettate!");
}


/**
 * Ottieni statistiche di un evento
 */
function getStatisticheEvento(eventCode) {
  const eventConfig = EVENTS[eventCode];
  
  if (!eventConfig) {
    return { error: "Evento non trovato" };
  }
  
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(eventConfig.sheetName);
  
  if (!sheet) {
    return { error: "Foglio non trovato" };
  }
  
  const lastRow = sheet.getLastRow();
  const presenzeData = sheet.getRange(
    eventConfig.presenzaColumn + (HEADER_ROW + 1) + ":" + 
    eventConfig.presenzaColumn + lastRow
  ).getValues();
  
  let totaleIscritti = 0;
  let totalePresenti = 0;
  
  for (let i = 0; i < presenzeData.length; i++) {
    if (presenzeData[i][0] !== "") {
      totaleIscritti++;
      if (presenzeData[i][0].toString().toUpperCase() === "SI") {
        totalePresenti++;
      }
    }
  }
  
  const stats = {
    evento: eventConfig.name,
    totaleIscritti: totaleIscritti,
    totalePresenti: totalePresenti,
    totaleAssenti: totaleIscritti - totalePresenti,
    percentuale: totaleIscritti > 0 ? 
      ((totalePresenti / totaleIscritti) * 100).toFixed(2) + "%" : "0%"
  };
  
  Logger.log(JSON.stringify(stats, null, 2));
  return stats;
}


/**
 * Ottieni statistiche di tutti gli eventi
 */
function getStatisticheTuttiEventi() {
  const allStats = {};
  
  for (const code in EVENTS) {
    allStats[code] = getStatisticheEvento(code);
  }
  
  Logger.log("=== STATISTICHE TUTTI GLI EVENTI ===");
  Logger.log(JSON.stringify(allStats, null, 2));
  
  return allStats;
}

function debugEventi() {
  Logger.log("=== DEBUG EVENTI ===");
  
  // Mostra tutti gli eventi configurati
  Logger.log("Eventi configurati:");
  for (const code in EVENTS) {
    Logger.log("- Codice: " + code);
    Logger.log("  Nome: " + EVENTS[code].name);
    Logger.log("  Foglio: " + EVENTS[code].sheetName);
  }
  
  // Test specifico IACATANIA
  Logger.log("\n=== TEST IACATANIA ===");
  const eventCode = "IACATANIA";
  const eventConfig = EVENTS[eventCode];
  
  if (!eventConfig) {
    Logger.log("❌ ERRORE: Evento IACATANIA NON TROVATO in EVENTS");
  } else {
    Logger.log("✅ Evento trovato:");
    Logger.log("Nome: " + eventConfig.name);
    Logger.log("Foglio: " + eventConfig.sheetName);
    Logger.log("Email colonna: " + eventConfig.emailColumn);
    Logger.log("Presenza colonna: " + eventConfig.presenzaColumn);
  }
}