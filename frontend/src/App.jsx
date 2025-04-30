import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ProductList from './components/ProductList';
import SaleForm from './components/SaleForm';
import SalesHistory from './components/SalesHistory';
import './styles.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sales" element={<SaleForm />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/history" element={<SalesHistory />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;