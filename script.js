// ==========================================
// 1. DÉCLARATION DES ÉLÉMENTS HTML
// ==========================================
const amountInput = document.getElementById('amount');
const fromCurrencySelect = document.getElementById('fromCurrency');
const toCurrencySelect = document.getElementById('toCurrency');
const convertBtn = document.getElementById('convertBtn');
const resultText = document.getElementById('resultText');
const historyTableBody = document.getElementById('historyTableBody');

// Nouveaux éléments de la PopUp
const historyModal = document.getElementById('historyModal');
const openHistoryBtn = document.getElementById('openHistoryBtn');
const closeHistoryBtn = document.getElementById('closeHistoryBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// URLs de l'API
const API_URL = 'http://localhost:3000/api/convert';
const HISTORY_URL = 'http://localhost:3000/api/history';
const RATES_URL = 'http://localhost:3000/api/rates';

// ==========================================
// 2. FONCTIONS DE L'APPLICATION
// ==========================================

// --- RÉCUPÉRATION DES TAUX DYNAMIQUES ---
const loadLiveRates = async () => {
    try {
        const response = await fetch(RATES_URL);
        if (!response.ok) throw new Error("Impossible de charger les taux.");
        
        const rates = await response.json();
        
        if(document.getElementById('rate-eur-xof') && document.getElementById('rate-usd-xof')) {
            document.getElementById('rate-eur-xof').textContent = `${rates.XOF} XOF`;
            const usdToXof = (rates.XOF / rates.USD).toFixed(2);
            document.getElementById('rate-usd-xof').textContent = `${usdToXof} XOF`;
        }
    } catch (error) {
        console.error("[Rates Error]:", error.message);
    }
};

// --- OPÉRATION READ (Charger l'historique de la BDD) ---
const loadHistory = async () => {
    try {
        const response = await fetch(HISTORY_URL);
        if (!response.ok) throw new Error("Impossible de récupérer l'historique.");
        
        const historyData = await response.json();
        if (!historyTableBody) return;
        
        historyTableBody.innerHTML = ""; 

        if (historyData.length === 0) {
            historyTableBody.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; padding: 15px; color: #999; font-style: italic;">
                        Aucune conversion récente
                    </td>
                </tr>
            `;
            return;
        }

        historyData.forEach(item => {
            const dateObj = new Date(item.created_at || item.createdAt);
            const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const row = document.createElement('tr');
            row.style.borderBottom = "1px solid #eee";
            row.innerHTML = `
                <td style="padding: 8px; color: #888;">${timeString}</td>
                <td style="padding: 8px;" class="amount-cell"></td>
                <td style="padding: 8px; font-weight: bold; color: #2ecc71;" class="result-cell"></td>
            `;
            
            row.querySelector('.amount-cell').textContent = `${item.amount} ${item.from_currency || item.fromCurrency}`;
            row.querySelector('.result-cell').textContent = `= ${item.result} ${item.to_currency || item.toCurrency}`;
            
            historyTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("[History Error]:", error.message);
    }
};

// --- OPÉRATION CREATE (Effectuer la conversion) ---
const performConversion = async () => {
    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;

    if (isNaN(amount) || amount <= 0) {
        resultText.textContent = "❌ Veuillez entrer un montant supérieur à 0.";
        resultText.style.color = "#ff4d4d";
        return;
    }
    
    resultText.style.color = "#888";
    resultText.textContent = "⚙️ Synchronisation et calcul...";
    convertBtn.disabled = true; 

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, fromCurrency, toCurrency })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Une erreur est survenue.");

        resultText.style.color = "#2ecc71";
        resultText.textContent = `${data.amount} ${data.from} = ${data.result} ${data.to}`;
        
        // Si la popup est ouverte, on rafraîchit l'historique en même temps
        if (historyModal && historyModal.style.display === 'flex') {
            loadHistory();
        }

    } catch (error) {
        console.error("[API Error]:", error.message);
        resultText.textContent = `❌ ${error.message}`;
        resultText.style.color = "#ff4d4d";
    } finally {
        convertBtn.disabled = false;
    }
};

// --- OPÉRATION DELETE (Vider l'historique BDD) ---
const clearHistory = async () => {
    if (!confirm("Voulez-vous vraiment effacer tout l'historique ?")) return;

    try {
        const response = await fetch(HISTORY_URL, { method: 'DELETE' });
        if (!response.ok) throw new Error("Erreur lors de la suppression.");
        loadHistory();
    } catch (error) {
        console.error("[Delete Error]:", error.message);
        alert("Erreur : " + error.message);
    }
};

// ==========================================
// 3. ÉCOUTEURS D'ÉVÉNEMENTS (GUEST LIST)
// ==========================================

// Événements du convertisseur
if (convertBtn) convertBtn.addEventListener('click', performConversion);

// Événements d'ouverture / fermeture de la PopUp
if (openHistoryBtn && historyModal) {
    openHistoryBtn.addEventListener('click', () => {
        historyModal.style.display = 'flex'; // Affiche la popup
        loadHistory(); // Charge les données à l'ouverture
    });
}

if (closeHistoryBtn && historyModal) {
    closeHistoryBtn.addEventListener('click', () => {
        historyModal.style.display = 'none'; // Ferme la popup
    });
}

// Fermeture en cliquant en dehors du cadre blanc
window.addEventListener('click', (event) => {
    if (historyModal && event.target === historyModal) {
        historyModal.style.display = 'none';
    }
});

// Événement de suppression
if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', clearHistory);

// ==========================================
// 4. INITIALISATION AU CHARGEMENT
// ==========================================
loadLiveRates();