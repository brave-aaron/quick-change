const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;


app.use(cors({
    origin: '*', // Autorise toutes les requêtes (idéal pour ton environnement de développement local)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Connexion BDD
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'decodelabs_db'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Erreur MySQL :', err.message);
        return;
    }
    console.log('✅ Connecté avec succès à phpMyAdmin !');
});

// Source unique de vérité pour les taux
const exchangeRates = { "EUR": 1, "USD": 1.09, "XOF": 655.96 };

// --- REST ROUTE : GET /api/rates (Nouveau : Envoie les taux au Frontend) ---
app.get('/api/rates', (req, res) => {
    res.json(exchangeRates);
});

// --- REST ROUTE : POST /api/convert (Création de conversion) ---
app.post('/api/convert', (req, res) => {
    const { amount, fromCurrency, toCurrency } = req.body;
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: "Le montant doit être un nombre supérieur à 0." });
    }

    const amountInEUR = parsedAmount / exchangeRates[fromCurrency];
    const finalResult = amountInEUR * exchangeRates[toCurrency];
    const formattedResult = toCurrency === "XOF" ? Math.round(finalResult) : parseFloat(finalResult.toFixed(2));

    const sql = `INSERT INTO conversions (amount, from_currency, to_currency, result) VALUES (?, ?, ?, ?)`;
    const values = [parsedAmount, fromCurrency, toCurrency, formattedResult];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erreur interne lors de la sauvegarde." });
        }
        
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

// --- REST ROUTE : GET /api/history (Lecture de l'historique) ---
app.get('/api/history', (req, res) => {
    const sql = `SELECT * FROM conversions ORDER BY created_at DESC LIMIT 10`;
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Impossible de charger l'historique." });
        }
        res.json(results);
    });
});

// --- REST ROUTE : DELETE /api/history (Vider proprement la table) ---
app.delete('/api/history', (req, res) => {
    // TRUNCATE est plus propre pour vider entièrement une table et remettre l'AUTO_INCREMENT à 1
    const sql = `TRUNCATE TABLE conversions`;

    db.query(sql, (err, result) => {
        if (err) {
            console.error("❌ Erreur MySQL lors de la suppression :", err.message);
            return res.status(500).json({ error: "Impossible de vider la base de données." });
        }
        console.log("🗑️ Historique de la base de données vidé avec succès !");
        res.json({ success: true, message: "Historique supprimé avec succès." });
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Serveur en ligne sur http://localhost:${PORT}`);
});