import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Table, Button, Alert, Typography, Layout, Input, Space, Select, Tag } from 'antd';
import './products.css';

const { Content } = Layout;
const { Title } = Typography;

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ id: '', title: '', category_id: '', discountApplied: '' });
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
    const discountGt = searchParams.get('f[variants.discount][gt]');
    const discountEq = searchParams.get('f[variants.discount]');
    let discountApplied = '';

    if (discountGt === '0' || discountGt) {
      discountApplied = 'yes';
    } else if (discountEq === '0') {
      discountApplied = 'no';
    }
    setFilters({ id, title, category_id, discountApplied });
    setPagination((prev) => ({ ...prev, current: page, pageSize }));

    fetchProducts({ id, title, category_id, discountApplied }, page, pageSize);
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
      if (customFilters.discountApplied === 'yes') {
        params.append('f[variants.discount][gt]', '0');
      } else if (customFilters.discountApplied === 'no') {
        params.append('f[variants.discount]', '0');
      }
      params.append('limit', pageSize);
      params.append('page', page);

      const url = `https://torpedo.stage.olx-pk.run/api/seller_center/products?${params.toString()}`;

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

  const getCategoryName = (id) => {
    const category = categories.find((cat) => cat.id === id);
    return category ? category.name : id;
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveFilter = (key) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: '' };
      return updated;
    });
  };

  const resetFilters = () => {
    setFilters({ id: '', title: '', category_id: '', discountApplied: '' });
    navigate({ pathname: location.pathname });
  };

  const applyFilters = () => {
    const parts = [];

    if (filters.id) parts.push(`f[id]=${encodeURIComponent(filters.id)}`);
    if (filters.title) parts.push(`s[title]=${encodeURIComponent(filters.title)}`);
    if (filters.category_id) parts.push(`f[categories.breadcrumb.id]=${encodeURIComponent(filters.category_id)}`);
    if (filters.discountApplied === 'yes') {
      parts.push(`f[variants.discount][gt]=0`);
    } else if (filters.discountApplied === 'no') {
      parts.push(`f[variants.discount]=0`);
    }

    parts.push(`page=${pagination.current}`);
    parts.push(`limit=${pagination.pageSize}`);

    const queryString = parts.join('&');
    navigate({ pathname: location.pathname, search: queryString });
  };

  const handleTableChange = (paginationInfo) => {
    setPagination({
      ...pagination,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
    });

    const parts = [];

    if (filters.id) parts.push(`f[id]=${encodeURIComponent(filters.id)}`);
    if (filters.title) parts.push(`s[title]=${encodeURIComponent(filters.title)}`);
    if (filters.category_id) parts.push(`f[categories.breadcrumb.id]=${encodeURIComponent(filters.category_id)}`);
    if (filters.discountApplied === 'yes') {
      parts.push(`f[variants.discount][gt]=0`);
    } else if (filters.discountApplied === 'no') {
      parts.push(`f[variants.discount]=0`);
    }

    parts.push(`page=${paginationInfo.current}`);
    parts.push(`limit=${paginationInfo.pageSize}`);

    const queryString = parts.join('&');

    navigate({ pathname: location.pathname, search: queryString });
    fetchProducts(filters, paginationInfo.current, paginationInfo.pageSize);
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

          <div style={{ marginBottom: '16px' }}>
            <Space wrap style={{ marginBottom: '8px' }}>
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
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                allowClear
              >
                {categories.map((cat) => (
                  <Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Discount Applied"
                style={{ width: 160 }}
                value={filters.discountApplied || undefined}
                onChange={(value) => setFilters((prev) => ({ ...prev, discountApplied: value }))}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                allowClear
              >
                <Option value="yes">Yes</Option>
                <Option value="no">No</Option>
              </Select>
            </Space>
            <Space style={{ marginBottom: '8px' }}>
              {filters.id && <Tag closable onClose={() => handleRemoveFilter('id')}>ID: {filters.id}</Tag>}
              {filters.title && <Tag closable onClose={() => handleRemoveFilter('title')}>Title: {filters.title}</Tag>}
              {filters.category_id && <Tag closable onClose={() => handleRemoveFilter('category_id')}>Category: {getCategoryName(filters.category_id)}</Tag>}
              {filters.discountApplied && <Tag closable onClose={() => handleRemoveFilter('discountApplied')}>Discount: {filters.discountApplied === 'yes' ? 'Yes' : 'No'}</Tag>}
            </Space>
            <Space>
              <Button type="primary" onClick={applyFilters}>
                Apply Filters
              </Button>
              <Button onClick={resetFilters}>
                Reset Filters
              </Button>
            </Space>
          </div>

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
