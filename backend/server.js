const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3001;

// NEW: Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());
app.set('trust proxy', true); // important when behind load balancers / ingress

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ipdb';

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const ipSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  reversedIp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const IpEntry = mongoose.model('IpEntry', ipSchema, 'ipentries');

function normalizeIp(ip) {
  if (!ip) return '';
  // If header has multiple IPs, take the first (left-most)
  if (ip.includes(',')) ip = ip.split(',')[0].trim();
  // Remove IPv4-mapped IPv6 prefix
  if (ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');
  // Normalize IPv6 loopback
  if (ip === '::1') ip = '::1';
  return ip;
}

function reverseIpString(ip) {
  if (!ip) return '';
  if (ip.includes('.')) {
    const parts = ip.split('.');
    return parts.reverse().join('.');
  } else if (ip.includes(':')) {
    const parts = ip.split(':');
    return parts.filter(Boolean).reverse().join(':');
  }
  return ip.split('').reverse().join('');
}

// Handles GET for both / and /reverse-ip
app.get(['/', '/reverse-ip'], async (req, res) => {
  try {
    // If ?ip= is provided, use it (keeps your frontend working).
    const provided = req.query.ip;
    let clientIp = provided || req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress || '';

    clientIp = normalizeIp(clientIp);
    const reversed = reverseIpString(clientIp);

    const entry = new IpEntry({ ip: clientIp, reversedIp: reversed });
    await entry.save();

    res.json({ ip: clientIp, reversedIp: reversed });
  } catch (err) {
    console.error('Error in /reverse-ip:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// NEW: Handles POST for /reverse-ip
app.post('/reverse-ip', async (req, res) => {
  try {
    const clientIp = normalizeIp(req.body.ip);
    if (!clientIp) {
      return res.status(400).json({ error: 'IP address not provided in request body' });
    }

    const reversed = reverseIpString(clientIp);

    const entry = new IpEntry({ ip: clientIp, reversedIp: reversed });
    await entry.save();

    res.json({ ip: clientIp, reversedIp: reversed });
  } catch (err) {
    console.error('Error in POST /reverse-ip:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/history', async (req, res) => {
  try {
    const history = await IpEntry.find().sort({ createdAt: -1 }).limit(50);
    res.json(history);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/clear-history', async (req, res) => {
  try {
    await IpEntry.deleteMany({});
    res.json({ message: 'History cleared' });
  } catch (err) {
    console.error('Error clearing history:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Health endpoint for K8s liveness/readiness probes
app.get('/health', (req, res) => res.status(200).send('ok'));

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});