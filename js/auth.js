/**
 * Modulo autenticazione e gestione sessione.
 */

const Auth = (() => {
    let currentUser = '';
    let currentEvent = '';
    let currentEventName = '';
    let lastActivityTime = Date.now();
    let timeoutInterval = null;

    function init() {
        const savedUser = localStorage.getItem('loggedUser');
        const savedTime = localStorage.getItem('loginTime');
        const savedEvent = localStorage.getItem('selectedEvent');
        const savedEventName = localStorage.getItem('selectedEventName');

        if (savedUser && savedTime && savedEvent) {
            const elapsedMinutes = (Date.now() - parseInt(savedTime)) / (1000 * 60);

            if (elapsedMinutes < CONFIG.SESSION_TIMEOUT_MINUTES) {
                currentUser = savedUser;
                currentEvent = savedEvent;
                currentEventName = savedEventName || savedEvent;
                UI.showScanner(currentUser, currentEvent, currentEventName);
                startTimeoutMonitor();
                return;
            }
        }
        // Nessuna sessione valida, resta sulla schermata login
    }

    function handleLogin() {
        const username = document.getElementById('loginUsername').value.trim().toLowerCase();
        const password = document.getElementById('loginPassword').value;
        const eventCode = document.getElementById('eventSelect').value;

        if (!username || !password) {
            UI.showLoginStatus('Inserisci username e password', 'error');
            return;
        }

        if (!eventCode) {
            UI.showLoginStatus('Seleziona un evento', 'error');
            return;
        }

        if (CONFIG.USERS[username] && CONFIG.USERS[username] === password) {
            currentUser = username;
            currentEvent = eventCode;
            currentEventName = CONFIG.EVENTS[eventCode].name;

            localStorage.setItem('loggedUser', username);
            localStorage.setItem('selectedEvent', eventCode);
            localStorage.setItem('selectedEventName', currentEventName);
            localStorage.setItem('loginTime', Date.now().toString());

            UI.showLoginStatus('Accesso effettuato!', 'success');

            setTimeout(() => {
                UI.showScanner(currentUser, currentEvent, currentEventName);
                startTimeoutMonitor();
            }, 1000);
        } else {
            UI.showLoginStatus('Credenziali non valide', 'error');
        }
    }

    function logout() {
        localStorage.removeItem('loggedUser');
        localStorage.removeItem('loginTime');
        localStorage.removeItem('selectedEvent');
        localStorage.removeItem('selectedEventName');
        clearInterval(timeoutInterval);

        Scanner.stop();
        UI.showLogin();

        currentUser = '';
        currentEvent = '';
        currentEventName = '';
        UI.showLoginStatus('Logout effettuato', 'info');
    }

    function startTimeoutMonitor() {
        document.addEventListener('click', updateActivity);
        document.addEventListener('keypress', updateActivity);
        document.addEventListener('touchstart', updateActivity);

        timeoutInterval = setInterval(() => {
            const elapsedMinutes = (Date.now() - lastActivityTime) / (1000 * 60);
            if (elapsedMinutes >= CONFIG.SESSION_TIMEOUT_MINUTES) {
                alert('Sessione scaduta per inattivita\u0300. Effettua nuovamente il login.');
                logout();
            }
        }, 60000);
    }

    function updateActivity() {
        lastActivityTime = Date.now();
        localStorage.setItem('loginTime', Date.now().toString());
    }

    function getUser() { return currentUser; }
    function getEvent() { return currentEvent; }
    function getEventName() { return currentEventName; }

    return { init, handleLogin, logout, getUser, getEvent, getEventName, updateActivity };
})();
