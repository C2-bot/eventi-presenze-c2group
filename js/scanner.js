/**
 * Modulo gestione QR Code scanner.
 */

const Scanner = (() => {
    let html5QrcodeScanner = null;
    let isScanning = false;

    function start() {
        if (isScanning) return;

        html5QrcodeScanner = new Html5Qrcode("reader");

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };

        html5QrcodeScanner.start(
            { facingMode: "environment" },
            config,
            onScanSuccess,
            () => {} // errori normali di scansione ignorati
        ).then(() => {
            isScanning = true;
            document.getElementById('startButton').style.display = 'none';
            document.getElementById('stopButton').style.display = 'block';
            UI.showStatus('Scanner attivo. Inquadra il QR Code.', 'info');
        }).catch(err => {
            UI.showStatus('Errore avvio scanner: ' + err, 'error');
        });
    }

    function stop() {
        if (!isScanning || !html5QrcodeScanner) return;

        html5QrcodeScanner.stop().then(() => {
            isScanning = false;
            document.getElementById('startButton').style.display = 'block';
            document.getElementById('stopButton').style.display = 'none';
            UI.showStatus('Scanner fermato', 'info');
        }).catch(err => {
            console.error('Errore stop scanner:', err);
        });
    }

    function onScanSuccess(decodedText) {
        stop();
        Registration.register(decodedText);
    }

    function getIsScanning() { return isScanning; }

    return { start, stop, getIsScanning };
})();
