const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public')); 

const HIGHSCORE_FILE = 'highscores.json';

app.get('/leaderboard', (req, res) => {
    fs.readFile(HIGHSCORE_FILE, (err, data) => {
        if (err) return res.status(500).send('Server error');
        const scores = JSON.parse(data);
        scores.sort((a, b) => b.score - a.score);
        res.json(scores.slice(0, 10)); 
    });
});

app.post('/submit-score', (req, res) => {
    const { name, score } = req.body;
    if (!name || typeof score !== 'number') {
        return res.status(400).send('Invalid data');
    }

    fs.readFile(HIGHSCORE_FILE, (err, data) => {
        const scores = err ? [] : JSON.parse(data);
        scores.push({ name, score });

        fs.writeFile(HIGHSCORE_FILE, JSON.stringify(scores, null, 2), err => {
            if (err) return res.status(500).send('Failed to save score');
            res.status(200).send('Score saved');
        });
    });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

