const express = require('express');
const cors = require('cors'); 
const app = express();
const PORT = 3000;

// Middleware indispensable pour lire le format JSON dans les requêtes POST
app.use(express.json());
app.use(cors()); // Autorise toutes les requêtes cross-origin

// Simulation de la base de données des taux (Base EUR)
const exchangeRates = {
    "EUR": 1,
    "USD": 1.09,
    "XOF": 655.96
};

// --- ENDPOINTS ---

// 1. GET /api/rates - Récupérer les taux du jour
app.get('/api/rates', (req, res) => {
    // Statut 200 OK implicite, retour en JSON pur
    res.json(exchangeRates); 
});

// 2. POST /api/convert - Effectuer une conversion avec validation stricte
app.post('/api/convert', (req, res) => {
    const { amount, fromCurrency, toCurrency } = req.body;

    // --- VALIDATION "Never Trust the Client" ---
    // 1. Vérification syntaxique : le montant doit être un nombre valide et supérieur à 0
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ 
            error: "Bad Request", 
            message: "Le montant doit être un nombre supérieur à 0." 
        });
    }

    // 2. Vérification sémantique : les devises doivent exister dans notre système
    if (!fromCurrency || !toCurrency || !exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
        return res.status(400).json({ 
            error: "Bad Request", 
            message: "Devise d'origine ou de destination non supportée." 
        });
    }

    // Si tout est OK, on procède au calcul sécurisé côté serveur
    const amountInEUR = parsedAmount / exchangeRates[fromCurrency];
    const finalResult = amountInEUR * exchangeRates[toCurrency];

    // Arrondi intelligent (Pas de centimes pour le XOF)
    const formattedResult = toCurrency === "XOF" 
        ? Math.round(finalResult) 
        : parseFloat(finalResult.toFixed(2));

    // Réponse exclusive en JSON avec statut 200 OK
    res.json({
        success: true,
        amount: parsedAmount,
        from: fromCurrency,
        to: toCurrency,
        result: formattedResult
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur QuickChange en ligne sur http://localhost:${PORT}`);
});