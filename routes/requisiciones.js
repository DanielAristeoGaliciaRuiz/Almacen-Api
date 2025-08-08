const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  const { folio, fecha, solicitado_por, productos } = req.body;

  const client = await db.connect();
  try {
  
    const check = await client.query('SELECT 1 FROM requisiciones WHERE folio = $1', [folio]);
    if (check.rowCount > 0) {
      return res.status(400).json({ message: 'Folio ya registrado' });
    }

    await client.query('BEGIN');

    const insertReq = await client.query(`
      INSERT INTO requisiciones (folio, fecha, solicitado_por)
      VALUES ($1, $2, $3)
      RETURNING id_requisicion
    `, [folio, fecha, solicitado_por]);

    const id_requisicion = insertReq.rows[0].id_requisicion;

    for (const prod of productos) {
      await client.query(`
        INSERT INTO detalle_requisicion (id_requisicion, nombre_producto, cantidad_solicitada)
        VALUES ($1, $2, $3)
      `, [id_requisicion, prod.nombre_producto, prod.cantidad_solicitada]);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Requisición creada', id_requisicion });
  } catch (error) {
  await client.query('ROLLBACK');
  console.error('Error en POST /api/requisiciones:', error); 
  res.status(500).json({ error: error.message });
} finally {
    client.release();
  }
});


router.put('/:id/surtir', async (req, res) => {
  const { id } = req.params;
  const { productos, id_usuario_entrega } = req.body;

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    
    await client.query(`
      UPDATE requisiciones
      SET id_usuario_entrega = $1
      WHERE id_requisicion = $2
    `, [id_usuario_entrega, id]);

   
    for (const prod of productos) {
      await client.query(`
        UPDATE detalle_requisicion
        SET cantidad_entregada = $1
        WHERE id_detalle = $2 AND id_requisicion = $3
      `, [prod.cantidad_entregada, prod.id_detalle, id]);
    }

    await client.query('COMMIT');
    res.json({ message: 'Requisición surtida correctamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

module.exports = router;
