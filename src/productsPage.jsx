import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Table, Button, Alert, Typography, Layout, Input, Space, Select } from 'antd';
import './products.css';

const { Content } = Layout;
const { Title } = Typography;

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ id: '', title: '', category_id: '' });
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const navigate = useNavigate();
  const location = useLocation();

  const { Option } = Select;

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/');
      return;
    }
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('f[id]') || '';
    const title = searchParams.get('s[title]') || '';
    const category_id = searchParams.get('f[categories.breadcrumb.id]') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const pageSize = parseInt(searchParams.get('limit')) || 10;
  
    setFilters({ id, title, category_id });
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
  
    fetchProducts({ id, title, category_id }, page, pageSize);
    fetchCategories();
  }, [location.search, navigate]);  
  
  const fetchProducts = async (customFilters, page = 1, pageSize = 10) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/');
      return;
    }
  
    try {
      const params = new URLSearchParams();
      if (customFilters.id) params.append('f[id]', customFilters.id);
      if (customFilters.title) params.append('s[title]', customFilters.title);
      if (customFilters.category_id) params.append('f[categories.breadcrumb.id]', customFilters.category_id);
      params.append('limit', pageSize);
      params.append('page', page);
  
      const url = `https://torpedo.stage.olx-pk.run/api/seller_center/products?${params.toString()}`;
  
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('API response:', res.data);
      setProducts(res.data?.products || []);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize,
        total: res.data?.pagination?.total_count || 0,
      }));
      setError('');
    } catch (err) {
      setError('Failed to fetch products');
    }
  };  
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get('https://torpedo.stage.olx-pk.run/api/seller_center/categories?sort[name]=asc&page=1', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories(res.data?.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };  

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };
  const handleTableChange = (paginationInfo) => {
    const updatedPagination = {
      ...pagination,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
    };
    setPagination(updatedPagination);
  
    const params = new URLSearchParams();
    if (filters.id) params.append('f[id]', filters.id);
    if (filters.title) params.append('s[title]', filters.title);
    if (filters.category_id) {
      params.append('f[categories.breadcrumb.id]', filters.category_id);
    }
    params.append('page', paginationInfo.current);
    params.append('limit', paginationInfo.pageSize);
  
    navigate({ pathname: location.pathname, search: params.toString() });
  
    fetchProducts(filters, paginationInfo.current, paginationInfo.pageSize);
  };   

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ id: '', title: '', category_id: '' });
    navigate({ pathname: location.pathname });
  };  

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (filters.id) params.append('f[id]', filters.id);
    if (filters.title) params.append('s[title]', filters.title);
    if (filters.category_id) {
      params.append('f[categories.breadcrumb.id]', filters.category_id);
    }
    params.append('page', pagination.current);
    params.append('limit', pagination.pageSize);
  
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
    {
      title: 'Status',
      dataIndex: ['status', 'name'],
      key: 'status',
      render: (status) => status || 'N/A',
    },
    {
      title: 'Quantity',
      dataIndex: 'total_quantity',
      key: 'quantity',
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
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
            <Input
              name="title"
              placeholder="Filter by Title"
              value={filters.title}
              onChange={handleFilterChange}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
            <Select
              placeholder="Filter by Category"
              style={{ width: 200 }}
              value={filters.category_id || undefined}
              onChange={(value) => setFilters((prev) => ({ ...prev, category_id: value }))}
              allowClear
            >
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>

            <Button type="primary" onClick={applyFilters}>
              Apply Filters
            </Button>
            <Button onClick={resetFilters}>
              Reset Filters
            </Button>
          </Space>

          <Table
            dataSource={products}
            columns={columns}
            rowKey="id"
            bordered
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
            }}
            onChange={handleTableChange}
            locale={{ emptyText: 'No products found.' }}
          />
        </div>
      </Content>
    </Layout>
  );
}

export default ProductsPage;
