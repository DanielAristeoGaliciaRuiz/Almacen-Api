const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM productos ORDER BY id_producto');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM productos WHERE id_producto = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post('/', async (req, res) => {
  try {
    const { nombre, cantidad, fecha_caducidad } = req.body;
    const result = await db.query(
      'INSERT INTO productos (nombre, cantidad, fecha_caducidad) VALUES ($1, $2, $3) RETURNING *',
      [nombre, cantidad, fecha_caducidad]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const { nombre, cantidad, fecha_caducidad } = req.body;
    const result = await db.query(
      'UPDATE productos SET nombre = $1, cantidad = $2, fecha_caducidad = $3 WHERE id_producto = $4 RETURNING *',
      [nombre, cantidad, fecha_caducidad, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM productos WHERE id_producto = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
