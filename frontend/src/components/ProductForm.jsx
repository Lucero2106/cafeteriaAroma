import { useState, useEffect } from 'react';
import axios from 'axios';

const ProductForm = ({ fetchProducts, editingProduct, setEditingProduct }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData(editingProduct);
    }
  }, [editingProduct]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await axios.put(`http://localhost:3000/api/products/${editingProduct.id}`, formData);
      } else {
        await axios.post('http://localhost:3000/api/products', formData);
      }
      fetchProducts();
      setFormData({ name: '', description: '', price: '', stock: '' });
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="mb-3">
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={formData.name}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>
      <div className="mb-3">
        <input
          type="text"
          name="description"
          placeholder="Descripción"
          value={formData.description}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      <div className="mb-3">
        <input
          type="number"
          name="price"
          placeholder="Precio"
          value={formData.price}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>
      <div className="mb-3">
        <input
          type="number"
          name="stock"
          placeholder="Stock"
          value={formData.stock}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>
      <div className="text-center">
        <button type="submit" className="btn btn-primary">
          {editingProduct ? 'Actualizar' : 'Agregar'}
        </button>
        {editingProduct && (
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={() => setEditingProduct(null)}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default ProductForm;