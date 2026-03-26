/**
 * Entry point dell'applicazione.
 * Inizializza tutti i moduli e collega gli event listener.
 */

window.onload = function () {
    UI.populateEventDropdown();
    Auth.init();
};

document.addEventListener('DOMContentLoaded', function () {
    const emailInput = document.getElementById('emailInput');
    if (emailInput) {
        emailInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') Registration.registerManual();
        });
    }

    const loginPassword = document.getElementById('loginPassword');
    if (loginPassword) {
        loginPassword.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') Auth.handleLogin();
        });
    }
});
