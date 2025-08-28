const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const { sequelize } = require('./models/index')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas básicas
app.use('/api', require('./routes/routes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server running34' });
});

app.listen(PORT, function () {
  console.log(`🚀 Server running on http://localhost:${PORT}`);

  sequelize.authenticate().then(() => {
    console.log('Nos hemos conectado a la base de datos')
  }).catch(error => {
    console.error('Error conectando a la base de datos:', error)
  });
});