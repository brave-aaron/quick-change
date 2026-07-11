const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// --- CONNEXION À LA BASE DE DONNÉES ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'decodelabs_db'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Erreur de connexion MySQL :', err.message);
        return;
    }
    console.log('✅ Connecté avec succès à phpMyAdmin !');
});

// Source unique de vérité pour les taux
const exchangeRates = { "EUR": 1, "USD": 1.09, "XOF": 655.96 };

// --- REST ROUTE : GET /api/rates ---
app.get('/api/rates', (req, res) => {
    res.json(exchangeRates);
});

// --- REST ROUTE : POST /api/conversions (CREATE - SQL INSERT) ---
app.post('/api/conversions', (req, res) => {
    const { amount, fromCurrency, toCurrency } = req.body;
    const parsedAmount = parseFloat(amount);

    // Validation stricte des données côté serveur
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: "Le montant doit être un nombre supérieur à 0." });
    }

    // Calcul de la conversion
    const amountInEUR = parsedAmount / exchangeRates[fromCurrency];
    const finalResult = amountInEUR * exchangeRates[toCurrency];
    const formattedResult = toCurrency === "XOF" ? Math.round(finalResult) : parseFloat(finalResult.toFixed(2));

    // SÉCURITÉ : Requête paramétrée avec "?" pour neutraliser les injections SQL (Exigence Page 16)
    const sql = `INSERT INTO conversions (amount, from_currency, to_currency, result) VALUES (?, ?, ?, ?)`;
    const values = [parsedAmount, fromCurrency, toCurrency, formattedResult];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Erreur lors de l'insertion :", err);
            return res.status(500).json({ error: "Erreur interne lors de la sauvegarde." });
        }
        
        res.status(201).json({
            success: true,
            id: result.insertId,
            amount: parsedAmount,
            from: fromCurrency,
            to: toCurrency,
            result: formattedResult
        });
    });
});

// --- REST ROUTE : GET /api/history (READ - SQL SELECT) ---
app.get('/api/history', (req, res) => {
    const sql = `SELECT * FROM conversions ORDER BY created_at DESC LIMIT 10`;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Erreur lors de la lecture :", err);
            return res.status(500).json({ error: "Impossible de charger l'historique." });
        }
        res.status(200).json(results);
    });
});

app.listen(PORT, () => {
    console.log(`🚀 [Projet 3 - Vault] Serveur connecté BDD sur http://localhost:${PORT}`);
});
