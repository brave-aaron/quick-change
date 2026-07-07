const express = require('express');
const cors = require('cors');
const mysql = require('mysql2'); // Import du pilote MySQL sécurisé

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- LE PONT : Connexion à MySQL via phpMyAdmin ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',          // Identifiant par défaut sous XAMPP
    password: '',          // Mot de passe vide par défaut sous XAMPP
    database: 'decodelabs_db'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Échec de la connexion à MySQL :', err.message);
        return;
    }
    console.log('✅ Le Pont est établi : Connecté avec succès à phpMyAdmin !');
});

// Taux de change fixes (Base EUR)
const exchangeRates = { "EUR": 1, "USD": 1.09, "XOF": 655.96 };

// --- L'ACTION : ROUTES HTTP RESTful (CRUD) ---

// 1. [POST] /api/convert -> Effectuer et SAUVEGARDER la conversion (CREATE)
app.post('/api/convert', (req, res) => {
    const { amount, fromCurrency, toCurrency } = req.body;
    const parsedAmount = parseFloat(amount);

    // --- LE BOUCLIER : Validation et intégrité des données ---
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: "Le montant doit être un nombre supérieur à 0." });
    }

    const amountInEUR = parsedAmount / exchangeRates[fromCurrency];
    const finalResult = amountInEUR * exchangeRates[toCurrency];
    const formattedResult = toCurrency === "XOF" ? Math.round(finalResult) : parseFloat(finalResult.toFixed(2));

    // --- LE BOUCLIER : Requête paramétrée (sécurité totale contre les injections SQL) ---
    const sql = `INSERT INTO conversions (amount, from_currency, to_currency, result) VALUES (?, ?, ?, ?)`;
    const values = [parsedAmount, fromCurrency, toCurrency, formattedResult];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erreur lors de l'enregistrement en base de données." });
        }
        
        // Envoi de la réponse contenant l'ID unique généré par la clé primaire
        res.json({
            success: true,
            id: result.insertId, 
            amount: parsedAmount,
            from: fromCurrency,
            to: toCurrency,
            result: formattedResult
        });
    });
});

// 2. [GET] /api/history -> Récupérer l'historique des requêtes (READ)
app.get('/api/history', (req, res) => {
    const sql = `SELECT * FROM conversions ORDER BY created_at DESC LIMIT 10`;
    
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Impossible de récupérer l'historique depuis la base de données." });
        }
        res.json(results); // Retourne le tableau des 10 dernières lignes au format JSON
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur QuickChange (MySQL + phpMyAdmin) en ligne sur http://localhost:${PORT}`);
});