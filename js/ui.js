/**
 * Modulo UI helpers e rendering dinamico.
 */

const UI = (() => {

    /**
     * Popola il dropdown eventi leggendo CONFIG.EVENTS.
     * Chiamato una volta al caricamento pagina.
     */
    function populateEventDropdown() {
        const select = document.getElementById('eventSelect');
        // Rimuovi tutte le option tranne la prima (placeholder)
        while (select.options.length > 1) {
            select.remove(1);
        }

        for (const [code, event] of Object.entries(CONFIG.EVENTS)) {
            if (!event.active) continue;
            const option = document.createElement('option');
            option.value = code;
            option.textContent = event.name;
            select.appendChild(option);
        }
    }

    function showScanner(user, event, eventName) {
        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('scannerArea').classList.add('show');
        document.getElementById('scannerControls').style.display = 'block';
        document.getElementById('userInfo').style.display = 'block';
        document.getElementById('currentUser').textContent = user;
        document.getElementById('operatorName').textContent = user;
        document.getElementById('eventTitle').textContent = eventName;
        Registration.loadFromStorage();
    }

    function showLogin() {
        document.getElementById('loginContainer').classList.remove('hidden');
        document.getElementById('scannerArea').classList.remove('show');
        document.getElementById('userInfo').style.display = 'none';
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('eventSelect').value = '';
    }

    function showLoginStatus(message, type) {
        const statusEl = document.getElementById('loginStatus');
        statusEl.textContent = message;
        statusEl.className = 'status status-' + type + ' show';
        setTimeout(() => { statusEl.classList.remove('show'); }, 3000);
    }

    function showStatus(message, type) {
        const statusEl = document.getElementById('statusMessage');
        statusEl.textContent = message;
        statusEl.className = 'status status-' + type + ' show';
        if (type !== 'info') {
            setTimeout(() => { statusEl.classList.remove('show'); }, 5000);
        }
    }

    function showLoader(show) {
        const loader = document.getElementById('loader');
        loader.classList.toggle('show', show);
    }

    function toggleManualInput() {
        document.getElementById('manualInput').classList.toggle('show');
    }

    return { populateEventDropdown, showScanner, showLogin, showLoginStatus, showStatus, showLoader, toggleManualInput };
})();
