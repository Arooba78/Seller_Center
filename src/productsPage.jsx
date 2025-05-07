import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Alert, Typography, Layout } from 'antd';
import './products.css';

const { Content } = Layout;
const { Title } = Typography;

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/');
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          'https://torpedo.dev.olx-pk.run/api/seller_center/products',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProducts(res.data?.products || []);
      } catch (err) {
        setError('Failed to fetch products');
      }
    };

    fetchProducts();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
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
