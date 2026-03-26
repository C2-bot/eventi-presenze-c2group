/**
 * Script interattivo per aggiungere un nuovo evento.
 * Uso: npm run new-event
 *
 * Genera le istruzioni e i blocchi di codice da inserire
 * in config.js e apps-script/Code.js.
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
    console.log('\n=== Nuovo Evento C2 Group ===\n');

    const code = (await ask('Codice evento (es. WORKSHOP2026): ')).trim().toUpperCase();
    const name = (await ask('Nome completo (es. Workshop AI - Milano): ')).trim();
    const sheetName = (await ask('Nome tab Google Sheet (es. Iscrizioni Evento (Workshop AI)): ')).trim();
    const emailCol = (await ask('Colonna email nel foglio [default: E]: ')).trim().toUpperCase() || 'E';
    const presenzaCol = (await ask('Colonna presenza nel foglio [default: O]: ')).trim().toUpperCase() || 'O';

    rl.close();

    // --- Aggiorna config.js ---
    const configPath = path.join(__dirname, '..', 'js', 'config.js');
    let configContent = fs.readFileSync(configPath, 'utf8');

    const frontendBlock = `        "${code}": {\n            name: "${name}",\n            sheetName: "${sheetName}",\n            emailColumn: "${emailCol}",\n            presenzaColumn: "${presenzaCol}",\n            active: true\n        }`;

    // Inserisci prima dell'ultima chiusura di EVENTS
    const eventsEndRegex = /(\s+}\s*}\s*};)/;
    const match = configContent.match(eventsEndRegex);
    if (match) {
        configContent = configContent.replace(
            eventsEndRegex,
            `,\n${frontendBlock}\n    }\n};`
        );
        fs.writeFileSync(configPath, configContent);
        console.log('\n[OK] config.js aggiornato');
    } else {
        console.log('\n[WARN] Non sono riuscito ad aggiornare config.js automaticamente.');
        console.log('Aggiungi manualmente in EVENTS:');
        console.log(frontendBlock);
    }

    // --- Aggiorna apps-script/Code.js ---
    const scriptPath = path.join(__dirname, '..', 'apps-script', 'Code.js');
    let scriptContent = fs.readFileSync(scriptPath, 'utf8');

    const backendBlock = `  "${code}": {\n    name: "${name}",\n    sheetName: "${sheetName}",\n    emailColumn: "${emailCol}",\n    presenzaColumn: "${presenzaCol}"\n  }`;

    // Trova la chiusura di EVENTS nel backend
    const backendEventsEnd = /(\s*}\s*};)/;
    const backendMatch = scriptContent.match(backendEventsEnd);
    if (backendMatch) {
        scriptContent = scriptContent.replace(
            backendEventsEnd,
            `,\n${backendBlock}\n};`
        );
        fs.writeFileSync(scriptPath, scriptContent);
        console.log('[OK] apps-script/Code.js aggiornato');
    } else {
        console.log('[WARN] Non sono riuscito ad aggiornare Code.js automaticamente.');
        console.log('Aggiungi manualmente in EVENTS:');
        console.log(backendBlock);
    }

    console.log('\n=== Prossimi passi ===');
    console.log('1. Crea il tab "' + sheetName + '" nel Google Sheet');
    console.log('2. Verifica che le colonne email (' + emailCol + ') e presenza (' + presenzaCol + ') siano corrette');
    console.log('3. git add -A && git commit -m "Aggiunto evento ' + code + '" && git push');
    console.log('4. npm run clasp:push  (per aggiornare Apps Script)');
    console.log('5. Testa su https://presenze.c2group.it dopo 2-3 min\n');
}

main().catch(console.error);
