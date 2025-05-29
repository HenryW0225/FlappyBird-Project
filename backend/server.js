require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

app.post('/submit-score', async (req, res) => {
  const { name, score } = req.body;
  console.log("submitScore called with1:", score);
  if (!name || typeof score !== 'number') {
    return res.status(400).json({ error: 'Invalid input' });
  }
  const { data: existing, error: fetchError } = await supabase
    .from('Leaderboard')
    .select('score')
    .eq('name', name)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    return res.status(500).json({ error: fetchError.message });
  }
  console.log("submitScore called with2:", score);
  if (!existing) {
    const { error: insertError } = await supabase
      .from('Leaderboard')
      .insert([{ name, score }]);
    if (insertError) return res.status(500).json({ error: insertError.message });
  } else if (score > existing.score) {
    const { error: updateError } = await supabase
      .from('Leaderboard')
      .update({ score })
      .eq('name', name);
    if (updateError) return res.status(500).json({ error: updateError.message });
  }

  res.status(200).json({ message: 'Score submitted!' });
});

app.get('/leaderboard', async (req, res) => {
    const { data, error } = await supabase
      .from('Leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(10); 

    if (error) {
      return res.status(500).json({ error: error.message });
    }
  
    res.json(data);
  });
  

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
