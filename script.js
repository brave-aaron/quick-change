const amountInput = document.getElementById('amount');
const fromCurrencySelect = document.getElementById('fromCurrency');
const toCurrencySelect = document.getElementById('toCurrency');
const convertBtn = document.getElementById('convertBtn');
const resultText = document.getElementById('resultText');
const historyTableBody = document.getElementById('historyTableBody'); // Cible notre nouveau tableau

const API_URL = 'http://localhost:3000/api/convert';
const HISTORY_URL = 'http://localhost:3000/api/history';

// --- FONCTION : Récupérer l'historique (Opération READ du CRUD) ---
const loadHistory = async () => {
    try {
        const response = await fetch(HISTORY_URL);
        const historyData = await response.json();

        // On vide le tableau avant de le remplir
        historyTableBody.innerHTML = "";

        // On boucle sur les 10 dernières lignes renvoyées par phpMyAdmin
        historyData.forEach(item => {
            // Formatage rapide de la date SQLite/MySQL en heure locale (HH:MM)
            const dateObj = new Date(item.created_at || item.createdAt);
            const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const row = document.createElement('tr');
            row.style.borderBottom = "1px solid #eee";
            row.innerHTML = `
                <td style="padding: 8px; color: #888;">${timeString}</td>
                <td style="padding: 8px;">${item.amount} ${item.from_currency || item.fromCurrency}</td>
                <td style="padding: 8px; font-weight: bold; color: #2ecc71;">= ${item.result} ${item.to_currency || item.toCurrency}</td>
            `;
            historyTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Impossible de charger l'historique:", error);
    }
};

// --- FONCTION : Effectuer la conversion (Opération CREATE du CRUD) ---
const performConversion = async () => {
    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;

    if (isNaN(amount) || amount <= 0) {
        resultText.innerText = "Veuillez entrer un montant valide.";
        resultText.style.color = "#ff4d4d";
        return;
    }
    
    resultText.style.color = "";
    resultText.innerText = "Conversion en cours...";

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, fromCurrency, toCurrency })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Une erreur est survenue.");

        resultText.innerText = `${data.amount} ${data.from} = ${data.result} ${data.to}`;

        // 🔥 CRUCIAL : Une fois la conversion enregistrée en BDD, on rafraîchit le tableau !
        loadHistory();

    } catch (error) {
        console.error("Erreur API:", error);
        resultText.innerText = error.message;
        resultText.style.color = "#ff4d4d";
    }
};

// Écouteurs d'événements
convertBtn.addEventListener('click', performConversion);
amountInput.addEventListener('input', performConversion);
fromCurrencySelect.addEventListener('change', performConversion);
toCurrencySelect.addEventListener('change', performConversion);

// 🔥 CHARGEMENT INITIAL : On affiche l'historique dès que l'utilisateur ouvre la page
loadHistory();