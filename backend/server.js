const express = require('express');
const { app } = require('./app');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});
