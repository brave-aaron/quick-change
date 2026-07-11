const convertBtn = document.getElementById('convertBtn');
const amountInput = document.getElementById('amount');
const fromCurrency = document.getElementById('fromCurrency');
const toCurrency = document.getElementById('toCurrency');
const resultText = document.getElementById('resultText');

convertBtn.addEventListener('click', async () => {
    const amount = parseFloat(amountInput.value);
    const from = fromCurrency.value;
    const to = toCurrency.value;

    // Validation côté client avant l'envoi
    if (isNaN(amount) || amount <= 0) {
        resultText.style.color = '#ff4d4d';
        resultText.textContent = "Veuillez entrer un montant valide.";
        return;
    }

    resultText.style.color = '';
    resultText.textContent = "Traitement API en cours...";

    try {
        // Envoi asynchrone vers l'endpoint RESTful /api/conversions
        const response = await fetch('http://localhost:3000/api/conversions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: amount,
                fromCurrency: from,
                toCurrency: to
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Erreur lors du traitement");
        }
        
        const data = await response.json();

        // Affichage dynamique du résultat calculé par le serveur
        resultText.textContent = `${data.amount} ${data.from} = ${data.result} ${data.to}`;

    } catch (error) {
        console.error(error);
        resultText.style.color = '#ff4d4d';
        resultText.textContent = `Erreur : ${error.message}`;
    }
});
