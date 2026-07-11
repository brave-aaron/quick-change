const convertBtn = document.getElementById('convertBtn');
const amountInput = document.getElementById('amount');
const fromCurrency = document.getElementById('fromCurrency');
const toCurrency = document.getElementById('toCurrency');
const resultText = document.getElementById('resultText');

convertBtn.addEventListener('click', async () => {
    const amount = parseFloat(amountInput.value);
    const from = fromCurrency.value;
    const to = toCurrency.value;

    if (isNaN(amount) || amount <= 0) {
        resultText.style.color = '#ff4d4d';
        resultText.textContent = "Veuillez entrer un montant valide.";
        return;
    }

    resultText.style.color = '';
    resultText.textContent = "Sauvegarde et calcul en cours...";

    try {
        // Envoi à l'API pour calcul et stockage MySQL
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
            throw new Error(errorData.error || "Erreur serveur");
        }
        
        const data = await response.json();

        // Affichage du résultat renvoyé par la BDD
        resultText.textContent = `${data.amount} ${data.from} = ${data.result} ${data.to}`;

    } catch (error) {
        console.error(error);
        resultText.style.color = '#ff4d4d';
        resultText.textContent = `Erreur : ${error.message}`;
    }
});
