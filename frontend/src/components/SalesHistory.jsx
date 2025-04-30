import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:3000/api/sales')
      .then((response) => {
        setSales(response.data);
      })
      .catch((err) => {
        setError('Error al cargar el historial de ventas: ' + err.message);
      });

    axios
      .get('http://localhost:3000/api/sales/top-products')
      .then((response) => {
        setTopProducts(response.data);
      })
      .catch((err) => {
        setError('Error al cargar los productos más vendidos: ' + err.message);
      });
  }, []);

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  const refreshData = () => {
    setError(null);
    axios
      .get('http://localhost:3000/api/sales')
      .then((response) => {
        setSales(response.data);
      })
      .catch((err) => {
        setError('Error al cargar el historial de ventas: ' + err.message);
      });

    axios
      .get('http://localhost:3000/api/sales/top-products')
      .then((response) => {
        setTopProducts(response.data);
      })
      .catch((err) => {
        setError('Error al cargar los productos más vendidos: ' + err.message);
      });
  };

  return (
    <div>
      <div className="text-center mb-3">
        <button className="btn btn-secondary" onClick={refreshData}>
          Refrescar Datos
        </button>
      </div>
      <h2 className="text-center mb-4">Historial de Ventas</h2>
      <h3 className="text-center mb-3">Ventas Realizadas</h3>
      {sales.length === 0 ? (
        <p className="text-center">No hay ventas registradas.</p>
      ) : (
        <ul className="list-group">
          {sales.map((sale) => (
            <li key={sale.id} className="list-group-item">
              <p>
                <strong>Operación #{sale.id}</strong> - Total: $
                {(typeof sale.total === 'number' ? sale.total : parseFloat(sale.total) || 0).toFixed(2)}
              </p>
              <p>
                <strong>Fecha:</strong> {new Date(sale.created_at).toLocaleString()}
              </p>
              <ul className="list-group list-group-flush">
                {sale.items && sale.items.length > 0 ? (
                  sale.items.map((item, index) => (
                    <li key={index} className="list-group-item">
                      {item.name} x {item.quantity} - $
                      {(typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0).toFixed(2)}
                    </li>
                  ))
                ) : (
                  <li className="list-group-item">No hay ítems en esta venta.</li>
                )}
              </ul>
            </li>
          ))}
        </ul>
      )}
      <h3 className="text-center mt-4 mb-3">Productos Más Vendidos</h3>
      {topProducts.length === 0 ? (
        <p className="text-center">No hay datos de productos vendidos.</p>
      ) : (
        <ul className="list-group">
          {topProducts.map((product) => (
            <li key={product.id} className="list-group-item">
              {product.name} - Vendidos: {product.total_sold} unidades
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

class SalesHistoryWithBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="alert alert-danger">Algo salió mal al cargar el historial. Por favor, intenta de nuevo.</div>;
    }
    return <SalesHistory />;
  }
}

export default SalesHistoryWithBoundary;