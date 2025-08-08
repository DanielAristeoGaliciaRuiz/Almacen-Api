const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());

const authMiddleware = require('./middlewares/auth');
const loginRoutes = require('./routes/login');
const usuariosRoutes = require('./routes/usuarios');
const productosRoutes = require('./routes/productos');
const requisicionesRoutes = require('./routes/requisiciones');


app.use(cors());



app.use('/api/usuarios/login', loginRoutes);
app.use('/api/usuarios', usuariosRoutes);


app.use(authMiddleware);



app.use('/api/productos', productosRoutes);
app.use('/api/requisiciones', requisicionesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
