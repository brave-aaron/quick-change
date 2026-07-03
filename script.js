// 1. Tableau des taux de change fixes basé sur 1 Euro (EUR)
const exchangeRates = {
    "EUR": 1,
    "USD": 1.09,      // 1 EUR = 1.09 USD
    "XOF": 655.96     // 1 EUR = 655.96 XOF
};

// 2. Récupération des éléments HTML
const amountInput = document.getElementById('amount');
const fromCurrencySelect = document.getElementById('fromCurrency');
const toCurrencySelect = document.getElementById('toCurrency');
const convertBtn = document.getElementById('convertBtn');
const resultText = document.getElementById('resultText');

// 3. Fonction qui effectue le calcul
function performConversion() {
    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;

    // Vérification si le montant est valide
    if (isNaN(amount) || amount <= 0) {
        resultText.innerText = "Veuillez entrer un montant valide.";
        return;
    }

    // Si les deux devises sont identiques, pas besoin de calculer
    if (fromCurrency === toCurrency) {
        resultText.innerText = `${amount} ${fromCurrency} = ${amount} ${toCurrency}`;
        return;
    }

    // Calcul de la conversion en passant par la base EUR
    // Formule : Montant * (Taux_Cible / Taux_Origine)
    const amountInEUR = amount / exchangeRates[fromCurrency];
    const finalResult = amountInEUR * exchangeRates[toCurrency];

    // Affichage propre du résultat avec deux chiffres après la virgule
    resultText.innerText = `${amount} ${fromCurrency} = ${finalResult.toFixed(2)} ${toCurrency}`;
}

// 4. Écouteur d'événement sur le bouton de conversion
convertBtn.addEventListener('click', performConversion);