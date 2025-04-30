import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('sales');
  const [dateFilter, setDateFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    refreshData();
    axios
      .get('http://localhost:3000/api/products')
      .then((response) => {
        setProducts(response.data);
      })
      .catch((err) => {
        setError('Error al cargar los productos: ' + err.message);
      });
  }, []);

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

  // Filtrar ventas
  const filteredSales = sales.filter((sale) => {
    const saleDate = new Date(sale.created_at).toISOString().split('T')[0];
    const matchesDate = dateFilter ? saleDate === dateFilter : true;
    const matchesProduct = productFilter
      ? sale.items.some((item) => item.product_id === parseInt(productFilter))
      : true;
    return matchesDate && matchesProduct;
  });

  // Paginación
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Calcular el total de unidades vendidas para los porcentajes
  const totalUnitsSold = topProducts.reduce((sum, product) => sum + product.total_sold, 0);

  // Colores personalizados para cada producto
  const colors = [
    '#6b4e31', // Marrón oscuro
    '#8b6f47', // Marrón claro
    '#d4a373', // Beige
    '#e6ccb2', // Crema
    '#b08968', // Marrón medio
  ];

  // Datos para el gráfico de barras
  const chartData = {
    labels: topProducts.map((product) => product.name),
    datasets: [
      {
        label: 'Unidades Vendidas',
        data: topProducts.map((product) => product.total_sold),
        backgroundColor: topProducts.map((_, index) => colors[index % colors.length]), // Asignar colores cíclicamente
        borderColor: topProducts.map((_, index) => colors[index % colors.length]),
        borderWidth: 1,
      },
    ],
  };

  // Opciones del gráfico con tooltips personalizados
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Productos Más Vendidos',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const product = topProducts[context.dataIndex];
            const percentage = ((product.total_sold / totalUnitsSold) * 100).toFixed(1);
            return [
              `Producto: ${product.name}`,
              `Unidades Vendidas: ${product.total_sold}`,
              `Porcentaje del Total: ${percentage}%`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Unidades Vendidas',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Productos',
        },
      },
    },
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      <h2>Historial de Ventas</h2>
      <button onClick={refreshData} style={{ marginBottom: '10px' }}>
        Refrescar Datos
      </button>
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          Ventas Realizadas
        </button>
        <button
          className={`tab ${activeTab === 'top' ? 'active' : ''}`}
          onClick={() => setActiveTab('top')}
        >
          Top Productos
        </button>
      </div>
      <div className="tab-content">
        {activeTab === 'sales' && (
          <div>
            <h3>Ventas Realizadas</h3>
            <div className="filters">
              <div className="filter">
                <label>Filtrar por fecha: </label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
              <div className="filter">
                <label>Filtrar por producto: </label>
                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                >
                  <option value="">Todos</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {filteredSales.length === 0 ? (
              <p>No hay ventas que coincidan con los filtros.</p>
            ) : (
              <>
                <ul>
                  {paginatedSales.map((sale) => (
                    <li key={sale.id}>
                      <p>
                        <strong>Operación #{sale.id}</strong> - Total: $
                        {(typeof sale.total === 'number' ? sale.total : parseFloat(sale.total) || 0).toFixed(2)}
                      </p>
                      <p>
                        <strong>Fecha:</strong> {new Date(sale.created_at).toLocaleString()}
                      </p>
                      <ul>
                        {sale.items && sale.items.length > 0 ? (
                          sale.items.map((item, index) => (
                            <li key={index}>
                              {item.name} x {item.quantity} - $
                              {(typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0).toFixed(2)}
                            </li>
                          ))
                        ) : (
                          <li>No hay ítems en esta venta.</li>
                        )}
                      </ul>
                    </li>
                  ))}
                </ul>
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>
                  <span>
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        {activeTab === 'top' && (
          <div>
            <h3>Productos Más Vendidos</h3>
            {topProducts.length === 0 ? (
              <p>No hay datos de productos vendidos.</p>
            ) : (
              <>
                <div className="chart-container">
                  <Bar data={chartData} options={chartOptions} />
                </div>
                <ul>
                  {topProducts.map((product) => (
                    <li key={product.id}>
                      {product.name} - Vendidos: {product.total_sold} unidades
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Error Boundary
class SalesHistoryWithBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="error">Algo salió mal al cargar el historial. Por favor, intenta de nuevo.</div>;
    }
    return <SalesHistory />;
  }
}

export default SalesHistoryWithBoundary;