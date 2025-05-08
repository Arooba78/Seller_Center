import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Table, Button, Alert, Typography, Layout, Input, Space } from 'antd';
import './products.css';

const { Content } = Layout;
const { Title } = Typography;

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ id: '', title: '' });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/');
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('f[id]') || '';
    const title = searchParams.get('s[title]') || '';

    setFilters({ id, title });

    fetchProducts({ id, title });
  }, [location.search, navigate]);

  const fetchProducts = async (customFilters) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const params = new URLSearchParams();
      if (customFilters.id) params.append('f[id]', customFilters.id);
      if (customFilters.title) params.append('s[title]', customFilters.title);

      const url = `https://torpedo.stage.olx-pk.run/api/seller_center/products?${params.toString()}`;

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(res.data?.products || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch products');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (filters.id) params.append('f[id]', filters.id);
    if (filters.title) params.append('s[title]', filters.title);

    navigate({ pathname: location.pathname, search: params.toString() });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => text || 'Untitled Product',
    },
  ];

  return (
    <Layout className="products-container">
      <div className="logout-button-container">
        <Button type="primary" danger onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Content style={{ padding: '40px 24px' }}>
        <div className="product-list-card">
          <Title level={3}>Product Listings</Title>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}

          <Space style={{ marginBottom: '16px' }}>
            <Input
              name="id"
              placeholder="Filter by ID"
              value={filters.id}
              onChange={handleFilterChange}
            />
            <Input
              name="title"
              placeholder="Filter by Title"
              value={filters.title}
              onChange={handleFilterChange}
            />
            <Button type="primary" onClick={applyFilters}>
              Apply Filters
            </Button>
          </Space>

          <Table
            dataSource={products}
            columns={columns}
            rowKey="id"
            bordered
            pagination={false}
            locale={{ emptyText: 'No products found.' }}
          />
        </div>
      </Content>
    </Layout>
  );
}

export default ProductsPage;
