const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT d.*, p.nombre AS nombre_producto, r.folio
      FROM detalle_requisicion d
      JOIN productos p ON d.id_producto = p.id_producto
      JOIN requisiciones r ON d.id_requisicion = r.id_requisicion
      ORDER BY d.id_detalle
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT d.*, p.nombre AS nombre_producto
      FROM detalle_requisicion d
      JOIN productos p ON d.id_producto = p.id_producto
      WHERE d.id_detalle = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Detalle no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.put('/:id', async (req, res) => {
  const { cantidad_solicitada, cantidad_entregada } = req.body;

  const client = await db.connect();
  try {
    await client.query('BEGIN');


    const detalleAnterior = await client.query(
      'SELECT id_producto, cantidad_entregada FROM detalle_requisicion WHERE id_detalle = $1',
      [req.params.id]
    );

    if (detalleAnterior.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Detalle no encontrado' });
    }

    const { id_producto, cantidad_entregada: anterior } = detalleAnterior.rows[0];
    const diferencia = cantidad_entregada - anterior;


    const actualizado = await client.query(
      'UPDATE detalle_requisicion SET cantidad_solicitada = $1, cantidad_entregada = $2 WHERE id_detalle = $3 RETURNING *',
      [cantidad_solicitada, cantidad_entregada, req.params.id]
    );

    await client.query(
      'UPDATE productos SET cantidad = cantidad - $1 WHERE id_producto = $2',
      [diferencia, id_producto]
    );

    await client.query('COMMIT');
    res.json(actualizado.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});



router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM detalle_requisicion WHERE id_detalle = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Detalle no encontrado' });
    res.json({ message: 'Producto eliminado de la requisición' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
