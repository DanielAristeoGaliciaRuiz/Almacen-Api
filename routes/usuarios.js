const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT id_usuario, nombre, correo, rol FROM usuarios ORDER BY id_usuario');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id_usuario, nombre, correo, rol FROM usuarios WHERE id_usuario = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}); 


router.post('/', async (req, res) => {
  try {
    const { nombre, correo, contraseña, rol } = req.body;

 
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    const result = await db.query(
      'INSERT INTO usuarios (nombre, correo, contraseña, rol) VALUES ($1, $2, $3, $4) RETURNING id_usuario, nombre, correo, rol',
      [nombre, correo, hashedPassword, rol]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




const JWT_SECRET = 'mi_clave_secreta_super_segura';


router.post('/login', async (req, res) => {
  const { correo, contraseña } = req.body;

  try {

    const result = await db.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });


    const valid = await bcrypt.compare(contraseña, user.contraseña);
    if (!valid) return res.status(401).json({ error: 'Contraseña incorrecta' });

   
    const token = jwt.sign({ id_usuario: user.id_usuario, rol: user.rol }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      usuario: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



router.put('/:id', async (req, res) => {
  try {
    const { nombre, correo, contraseña, rol } = req.body;
    const result = await db.query(
      'UPDATE usuarios SET nombre = $1, correo = $2, contraseña = $3, rol = $4 WHERE id_usuario = $5 RETURNING id_usuario, nombre, correo, rol',
      [nombre, correo, contraseña, rol, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM usuarios WHERE id_usuario = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
