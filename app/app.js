const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const { sequelize } = require('./models/index')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/', require('./routes/routes'));


app.listen(PORT, function () {
  console.log(`Puerto: http://localhost:${PORT}`);

  sequelize.authenticate().then(() => {
    console.log('Conexion a la base de datos')
  }).catch(error => {
    console.error('Error al conectar con la base de datos:', error)
  });
});