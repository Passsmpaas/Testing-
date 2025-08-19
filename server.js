import express from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static('public'));

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';

// Login simulation - client sends username/password, server returns JWT
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Send login request to TeachX API
    const response = await axios.post('http://rozgarapinew.teachx.in/api/login', { username, password });
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '6h' });
    res.json({ token, teachxToken: response.data.token });
  } catch (err) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Fetch live batch from TeachX API
app.get('/batch', async (req, res) => {
  const teachxToken = req.headers['teachx-token'];
  if (!teachxToken) return res.status(401).send('Missing TeachX token');
  try {
    const response = await axios.get('http://rozgarapinew.teachx.in/api/live_batches', {
      headers: { Authorization: `Bearer ${teachxToken}` }
    });
    res.json(response.data); // return batch list
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch batch' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));