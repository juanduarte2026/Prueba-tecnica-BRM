const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const { sequelize } = require('./models/index');
const logger = require('./utils/logger'); 


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});


app.use('/', require('./routes/index'));


app.use('*', (req, res) => {
  logger.warn(`Ruta no encontrada: ${req.originalUrl}`);
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((error, req, res, next) => {
  logger.error('Error en la aplicación: ' + error.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, async function () {
  console.log(`Puerto: http://localhost:${PORT}`);

  try {
    await sequelize.authenticate();
    logger.info('Conexión a la base de datos OK');
  } catch (error) {
    logger.error('Error al conectar con la base de datos: ' + error.message);
    process.exit(1);
  }
});