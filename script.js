// Taux de change fixes simulés en local (Projet 2)
const localRates = {
    EUR: { USD: 1.09, XOF: 655.96, EUR: 1 },
    USD: { EUR: 0.92, XOF: 601.50, USD: 1 },
    XOF: { EUR: 0.0015, USD: 0.0017, XOF: 1 }
};

// Sélection des éléments du DOM
const convertBtn = document.getElementById('convertBtn');
const amountInput = document.getElementById('amount');
const fromCurrency = document.getElementById('fromCurrency');
const toCurrency = document.getElementById('toCurrency');
const resultText = document.getElementById('resultText');

// Écoute de l'événement clic sur le bouton
convertBtn.addEventListener('click', () => {
    const amount = parseFloat(amountInput.value);
    const from = fromCurrency.value;
    const to = toCurrency.value;

    // Validation des données de saisie
    if (isNaN(amount) || amount <= 0) {
        resultText.style.color = '#ff4d4d';
        resultText.textContent = "Veuillez entrer un montant valide.";
        return;
    }

    // Réinitialisation de la couleur par défaut
    resultText.style.color = '';

    // Récupération du taux correspondant et calcul
    const rate = localRates[from][to];
    const convertedAmount = (amount * rate).toFixed(2);

    // Affichage dynamique du résultat dans l'interface
    resultText.textContent = `${amount} ${from} = ${convertedAmount} ${to}`;
});
