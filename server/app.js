// ziklol.gg/server/app.js
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const riotRoutes = require('./routes/riot');
const matchRoutes = require('./routes/matches');
app.use('/api/matches', matchRoutes);
const PORT = 5000;

app.use(cors());
app.use(express.json());

// 라우터 연결
app.use('/api/riot', riotRoutes);

console.log('RIOT_API_KEY 값:', JSON.stringify(process.env.RIOT_API_KEY));


console.log('MONGODB_URI:', process.env.MONGODB_URI);

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
