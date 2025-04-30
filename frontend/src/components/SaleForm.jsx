import { useState, useEffect } from 'react';
import axios from 'axios';

const SaleForm = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [lastSale, setLastSale] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3000/api/products').then((response) => {
      setProducts(response.data);
    });
  }, []);

  const addToCart = (product) => {
    setCart([...cart, { product_id: product.id, quantity: 1, name: product.name, price: product.price }]);
  };

  const handleQuantityChange = (index, quantity) => {
    const newCart = [...cart];
    newCart[index].quantity = parseInt(quantity) || 1;
    setCart(newCart);
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/sales', { items: cart });
      setLastSale(response.data);
      setCart([]);
      alert('Venta registrada');
    } catch (error) {
      alert('Error al registrar la venta: ' + error.response?.data?.error || error.message);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="sale-container d-flex flex-wrap justify-content-center gap-3">
      <div className="sale-form">
        <h2 className="text-center mb-4">Registrar Venta</h2>
        <h3 className="text-center mb-3">Productos Disponibles</h3>
        {products.length === 0 ? (
          <p className="text-center">No hay productos disponibles.</p>
        ) : (
          <ul className="list-group mb-3">
            {products.map((product) => (
              <li key={product.id} className="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  {product.name} - ${product.price}
                </span>
                <button className="btn btn-sm btn-primary" onClick={() => addToCart(product)}>
                  Agregar
                </button>
              </li>
            ))}
          </ul>
        )}
        <h3 className="text-center mb-3">Carrito</h3>
        {cart.length === 0 ? (
          <p className="text-center">El carrito está vacío.</p>
        ) : (
          <ul className="list-group mb-3">
            {cart.map((item, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  {item.name} - ${item.price} x{' '}
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    min="1"
                    className="form-control d-inline-block"
                    style={{ width: '60px' }}
                  />
                </span>
                <button className="btn btn-sm btn-danger remove-btn" onClick={() => removeFromCart(index)}>
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="text-center">Total: ${total.toFixed(2)}</p>
        <div className="text-center">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={cart.length === 0}>
            Confirmar Venta
          </button>
        </div>
      </div>
      <div className="sale-ticket card p-3">
        <h3 className="text-center mb-3">Boleta de Venta</h3>
        {lastSale ? (
          <div>
            <p><strong>Número de Operación:</strong> {lastSale.id}</p>
            <p><strong>Total:</strong> ${lastSale.total.toFixed(2)}</p>
            <h4 className="mt-3">Productos:</h4>
            <ul className="list-group">
              {lastSale.items.map((item, index) => (
                <li key={index} className="list-group-item">
                  {item.name} x {item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-center">No hay boleta reciente.</p>
        )}
      </div>
    </div>
  );
};

export default SaleForm;