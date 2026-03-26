/**
 * Modulo registrazione presenze e gestione lead.
 */

const Registration = (() => {
    let registeredCount = 0;
    let registeredLeads = [];

    async function register(email) {
        const event = Auth.getEvent();
        if (!event) {
            UI.showStatus('Evento non selezionato!', 'error');
            return;
        }

        Auth.updateActivity();
        UI.showLoader(true);
        UI.showStatus('Registrazione in corso...', 'info');

        try {
            const url = new URL(CONFIG.SCRIPT_URL);
            url.searchParams.append('email', email.trim().toLowerCase());
            url.searchParams.append('event', event);
            url.searchParams.append('operator', Auth.getUser());

            const response = await fetch(url.toString(), { method: 'GET' });
            const result = await response.json();

            if (result.success) {
                registeredCount++;
                const now = new Date();
                document.getElementById('registeredCount').textContent = registeredCount;
                document.getElementById('lastRegistered').textContent = now.toLocaleTimeString('it-IT');
                addLead(email, now);
                UI.showStatus('Presenza registrata per: ' + email, 'success');
            } else {
                UI.showStatus(result.message, 'warning');
            }

            setTimeout(() => {
                if (!Scanner.getIsScanning()) {
                    Scanner.start();
                }
            }, 2000);

        } catch (error) {
            UI.showStatus('Errore registrazione: ' + error.message, 'error');
            console.error('Errore:', error);
        } finally {
            UI.showLoader(false);
        }
    }

    function registerManual() {
        const input = document.getElementById('emailInput');
        const email = input.value.trim();

        if (!email) {
            UI.showStatus('Inserisci un\'email valida', 'error');
            return;
        }
        if (!email.includes('@')) {
            UI.showStatus('Formato email non valido', 'error');
            return;
        }

        register(email);
        input.value = '';
    }

    function addLead(email, timestamp) {
        const event = Auth.getEvent();
        const eventName = Auth.getEventName();

        if (registeredLeads.find(l => l.email === email && l.event === event)) {
            return;
        }

        registeredLeads.unshift({
            email: email,
            timestamp: timestamp,
            timeString: timestamp.toLocaleString('it-IT'),
            event: event,
            eventName: eventName
        });

        localStorage.setItem('registeredLeads', JSON.stringify(registeredLeads));
        renderLeads();
    }

    function loadFromStorage() {
        const saved = localStorage.getItem('registeredLeads');
        if (saved) {
            registeredLeads = JSON.parse(saved);
            const currentEventLeads = registeredLeads.filter(l => l.event === Auth.getEvent());
            registeredCount = currentEventLeads.length;
            document.getElementById('registeredCount').textContent = registeredCount;
            renderLeads();
        }
    }

    function renderLeads() {
        const listContainer = document.getElementById('leadsList');
        const leadsCountEl = document.getElementById('leadsCount');
        const event = Auth.getEvent();
        const eventName = Auth.getEventName();
        const currentEventLeads = registeredLeads.filter(l => l.event === event);

        if (currentEventLeads.length === 0) {
            listContainer.innerHTML =
                '<div class="empty-state">' +
                '<p>Nessuna presenza registrata ancora</p>' +
                '<small>I lead per ' + eventName + ' appariranno qui dopo la prima scansione</small>' +
                '</div>';
            leadsCountEl.textContent = 'Nessun lead registrato per questo evento';
            return;
        }

        leadsCountEl.textContent = currentEventLeads.length + ' lead registrat' +
            (currentEventLeads.length === 1 ? 'o' : 'i') + ' per ' + eventName;

        let html = '';
        currentEventLeads.forEach(lead => {
            html +=
                '<div class="lead-item" data-email="' + lead.email + '">' +
                '<div class="lead-info">' +
                '<div class="lead-email">' + lead.email + '</div>' +
                '<div class="lead-time">' + lead.timeString + '</div>' +
                '</div>' +
                '<div class="lead-badge">Presente</div>' +
                '</div>';
        });

        listContainer.innerHTML = html;
    }

    function filterLeads() {
        const searchTerm = document.getElementById('searchLeads').value.toLowerCase();
        const leadItems = document.querySelectorAll('.lead-item');
        let visibleCount = 0;

        leadItems.forEach(item => {
            const email = item.getAttribute('data-email').toLowerCase();
            if (email.includes(searchTerm)) {
                item.style.display = 'flex';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        const event = Auth.getEvent();
        const total = registeredLeads.filter(l => l.event === event).length;

        if (visibleCount === 0 && total > 0) {
            document.getElementById('leadsList').innerHTML =
                '<div class="no-results">' +
                '<p>Nessun risultato per "' + document.getElementById('searchLeads').value + '"</p>' +
                '</div>';
        } else if (searchTerm) {
            document.getElementById('leadsCount').textContent = visibleCount + ' di ' + total + ' lead trovati';
        }
    }

    return { register, registerManual, loadFromStorage, filterLeads };
})();
