import { useState, useEffect } from 'react';
import styles from './ProductListing.module.css';
import { useNavigate } from 'react-router-dom';
import { Button, TextField,MenuItem,Select, TableContainer, TableHead, Table, TableRow, TableCell, TableBody } from '@mui/material';
import { BASE_URL } from '../../../constants';
export default function ProductListing() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const categories = [
    'Engine',
    'Suspension',
    'Braking',
    'Electricals',
    'Exhaust',
    'Body',
    'Accessories',
    'Other'
  ];

  // Fetch products
      const fetchProducts = async () => {
      try {
        setLoading(true);
        
        let url = 'http://localhost:2127/api/products';
        const params = new URLSearchParams();
        
        if (searchTerm) params.append('query', searchTerm);
        if (selectedVehicleId) params.append('vehicle_id', selectedVehicleId);
        if (selectedCategory) params.append('category', selectedCategory);
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        
        if (data.status && data.data) {
          setProducts(data.data);
        } else {
          setProducts([]);
        }
        
        setError(null);
      } catch (err) {
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {

    
    fetchProducts();
  }, [searchTerm, selectedVehicleId, selectedCategory]);

  // Fetch vehicles for dropdown
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('http://localhost:2127/api/vehicle');
        
        if (!response.ok) {
          throw new Error('Failed to fetch vehicles');
        }
        
        const data = await response.json();
        
        if (data.status && data.data) {
          setVehicles(data.data);
        } else {
          setVehicles([]);
        }
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setVehicles([]);
      }
    };
    
    fetchVehicles();
  }, []);

  // Handle search with debounce
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Sorting function
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting
  const sortedProducts = [...products].sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
    }
    return 0;
  });

  // Format date
  // const formatDate = (dateString) => {
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString('en-GB', { 
  //     year: 'numeric', 
  //     month: 'numeric', 
  //     day: 'numeric' 
  //   });
  // };

  // Function to determine stock status class
  const getStockStatusClass = (quantity) => {
    if (quantity === 0) return styles.outOfStock;
    if (quantity < 10) return styles.lowStock;
    return styles.inStock;
  };

  // Add new product button handler
  const handleAddProduct = () => {
    // Navigate to add product page or open modal
    navigate("/products/create");
    };
    async function onProuctDelete(event,id){
    console.log(id)
    const productId = id;
    if (!window.confirm("Are you sure you want to delete this Product?")) return;
    try {
          const response = await fetch(`${BASE_URL}/products/${productId}`, {
            method: "DELETE",
          });
          const data=await response.json();
          if (!data.status) {
          alert(data.message);
          return;
          }
          const response2 = await fetch(`${BASE_URL}/products`);
          const data2=await response2.json();
          if (!data.status) {
            alert(data.message);
            setProducts([])
            return;
          }
          setProducts(data2.data);

      } catch (err) {
         console.error("Error deleting Product:", err);
      }
    }
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Product Inventory</h1>
        <Button onClick={handleAddProduct} variant='contained' className={styles['addButton']}>
          + Add Product
        </Button>
      </div>
       
      {/* Filters and search */}
      <div className={styles.filterContainer}>
        
          <TextField
            type="text"
            fullWidth
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        
          <Select
            value={selectedVehicleId}
            displayEmpty
            style={{minWidth:"200px"}}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className={styles.filterSelect}
          >
            <MenuItem value="">All Vehicles</MenuItem>
            {vehicles.map((vehicle) => (
              <MenuItem key={vehicle.id} value={vehicle.id}>
                {vehicle.brand_name} - {vehicle.name}
              </MenuItem>
            ))}
          </Select>
        
       
          <Select
            value={selectedCategory}
            style={{minWidth:"200px"}}
            displayEmpty
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.filterSelect}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </Select>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Loading products...</p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className={styles.errorContainer}>
          <p>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Retry
          </button>
        </div>
      )}
      {/* Summary stats */}
      {!loading && !error && (
        <div className={styles.statsSummary}>
          <div className={styles.statCard}>
            <h3>Total Products</h3>
            <p>{sortedProducts.length}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Out of Stock</h3>
            <p>{sortedProducts.filter(p => p.quantity === 0).length}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Low Stock</h3>
            <p>{sortedProducts.filter(p => p.quantity > 0 && p.quantity < 10).length}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Total Inventory Value</h3>
            <p>₹{sortedProducts.reduce((sum, product) => sum + (product.selling_price * product.quantity), 0).toLocaleString()}</p>
          </div>
        </div>
      )}
      
      {/* Products table */}
      {!loading && !error && (
        <TableContainer className={styles.tableContainer}>
          <Table className={styles.productTable}>
            <TableHead>
              <TableRow>
                <TableCell onClick={() => requestSort('name')}>
                  Product Name {sortConfig.key === 'name' && (
                    <span>{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>
                  )}
                </TableCell>
                <TableCell onClick={() => requestSort('product_code')}>
                  Product Code {sortConfig.key === 'product_code' && (
                    <span>{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>
                  )}
                </TableCell>
                <TableCell onClick={() => requestSort('manufacturer_name')}>
                Manufacturer Name {sortConfig.key === 'manufacturer_name' && (
                    <span>{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>
                  )}
                </TableCell>
                <TableCell onClick={() => requestSort('category')}>
                  Category {sortConfig.key === 'category' && (
                    <span>{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>
                  )}
                </TableCell>
                <TableCell onClick={() => requestSort('quantity')}>
                  Stock {sortConfig.key === 'quantity' && (
                    <span>{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>
                  )}
                </TableCell>
                <TableCell onClick={() => requestSort('selling_price')}>
                  Price {sortConfig.key === 'selling_price' && (
                    <span>{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>
                  )}
                </TableCell>
                <TableCell onClick={() => requestSort('profit')}>
                  Profit {sortConfig.key === 'profit' && (
                    <span>{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>
                  )}
                </TableCell>
                
                <th>Actions</th>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedProducts.length > 0 ? (
                sortedProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.product_code}</TableCell>
                    <TableCell>{product.manufacturer_name}</TableCell>
                    <TableCell>
                         <span className={`${styles.categoryBadge} ${styles[`badge-${product.category}`]}`}>
                         {product.category}
                         </span>
                    </TableCell>
                    <TableCell className={getStockStatusClass(product.quantity)}>
                      {product.quantity} {product.quantity === 0 ? '(Out of Stock)' : product.quantity < 10 ? '(Low)' : ''}
                    </TableCell>
                    <TableCell>₹{product.selling_price.toLocaleString()}</TableCell>
                    <TableCell>₹{product.profit.toLocaleString()}</TableCell>
                 

                    {/* <TableCell>{formatDate(product.updatedAt)}</TableCell> */}
                    <TableCell>
                      <div className={styles.actionButtons}>
                        <Button variant="outlined" className={styles.editButton}>EDIT</Button>
                        <Button variant="outlined"className={styles.deleteButton} onClick={(event)=>onProuctDelete(event,product.id)}>DELETE</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="8" className={styles.noProducts}>No products found matching your criteria</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      
    </div>
  );
}