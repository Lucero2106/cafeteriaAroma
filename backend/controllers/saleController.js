const pool = require('../config/db');

// Crear venta (modificado para devolver más detalles)
exports.createSale = async (req, res) => {
  const { items } = req.body;
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    let total = 0;
    for (const item of items) {
      const [product] = await connection.query('SELECT price, stock FROM products WHERE id = ?', [item.product_id]);
      if (product[0].stock < item.quantity) throw new Error(`Stock insuficiente para ${item.name}`);
      total += product[0].price * item.quantity;
    }

    const [saleResult] = await connection.query('INSERT INTO sales (total) VALUES (?)', [total]);
    const saleId = saleResult.insertId;

    for (const item of items) {
      const [product] = await connection.query('SELECT price FROM products WHERE id = ?', [item.product_id]);
      await connection.query(
        'INSERT INTO sale_items (sale_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [saleId, item.product_id, item.quantity, product[0].price]
      );
      await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    await connection.commit();
    res.status(201).json({ id: saleId, total, items });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// Obtener historial de ventas
exports.getSales = async (req, res) => {
  try {
    const [sales] = await pool.query(`
      SELECT s.id, s.total, s.created_at, si.product_id, si.quantity, si.price, p.name
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      LEFT JOIN products p ON si.product_id = p.id
      ORDER BY s.created_at DESC
    `);
    // Agrupar por venta y convertir total a número
    const salesMap = sales.reduce((acc, row) => {
      if (!acc[row.id]) {
        acc[row.id] = {
          id: row.id,
          total: parseFloat(row.total), // Convertir a número
          created_at: row.created_at,
          items: [],
        };
      }
      if (row.product_id) {
        acc[row.id].items.push({
          product_id: row.product_id,
          name: row.name,
          quantity: row.quantity,
          price: parseFloat(row.price), // Convertir a número
        });
      }
      return acc;
    }, {});
    res.json(Object.values(salesMap));
  } catch (error) {
    res.status(500).json({ error: 'Error fetching sales' });
  }
};

// Obtener productos más vendidos
exports.getTopProducts = async (req, res) => {
  try {
    const [topProducts] = await pool.query(`
      SELECT p.id, p.name, SUM(si.quantity) as total_sold
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT 5
    `);
    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching top products' });
  }
};