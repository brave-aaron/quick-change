const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Taux centralisés (Source unique de vérité)
const exchangeRates = { "EUR": 1, "USD": 1.09, "XOF": 655.96 };

// --- ENDPOINT GET : /api/rates ---
// Conforme à la charte : "rates" est un nom (Noun)
app.get('/api/rates', (req, res) => {
    res.status(200).json(exchangeRates);
});

// --- ENDPOINT POST : /api/conversions ---
// Conforme à la charte Page 10 : Utilisation du nom "conversions" au lieu du verbe "convert"
app.post('/api/conversions', (req, res) => {
    const { amount, fromCurrency, toCurrency } = req.body;
    const parsedAmount = parseFloat(amount);

    // EXIGENCE : Validation de base des données (Page 4 du guide)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: "Le montant doit être un nombre supérieur à 0." });
    }

    // Traitement de la logique applicative (The Computation)
    const amountInEUR = parsedAmount / exchangeRates[fromCurrency];
    const finalResult = amountInEUR * exchangeRates[toCurrency];
    const formattedResult = toCurrency === "XOF" ? Math.round(finalResult) : parseFloat(finalResult.toFixed(2));

    // Réponse structurée renvoyée au format JSON
    res.status(201).json({
        success: true,
        amount: parsedAmount,
        from: fromCurrency,
        to: toCurrency,
        result: formattedResult
    });
});

app.listen(PORT, () => {
    console.log(`🚀 [Nervous System] API QuickChange active sur http://localhost:${PORT}`);
});
