import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Input, Button, Alert, Space } from 'antd';
import './app.css';

const LoginPage = () => {
  const navigate = useNavigate();

  const initialValues = {
    email: '',
    password: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const handleLogin = async (values, { setSubmitting, setFieldError }) => {
    try {
      const res = await axios.post('https://torpedo.stage.olx-pk.run/api/seller_center/auth/login', {
        email: values.email,
        password: values.password,
      });

      const token = res.data?.data?.access_token;
      if (token) {
        localStorage.setItem('authToken', token);
        navigate('/products');
      } else {
        setFieldError('email', 'No token received');
      }
    } catch (err) {
      setFieldError('email', err.response?.data?.error || 'Login failed');
    }
    setSubmitting(false);
  };

  return (
    <div className="container">
      <div className="login-card">
        <h2>Seller Center Login</h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleLogin}
        >
          {({ isSubmitting }) => (
            <Form>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Field name="email">
                  {({ field }) => (
                    <div>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Email"
                        size="large"
                        status={field.value && !field.value.includes('@') ? 'error' : ''}
                      />
                      <ErrorMessage name="email" component="div" className="error-box" />
                    </div>
                  )}
                </Field>

                <Field name="password">
                  {({ field }) => (
                    <div>
                      <Input.Password
                        {...field}
                        placeholder="Password"
                        size="large"
                      />
                      <ErrorMessage name="password" component="div" className="error-box" />
                    </div>
                  )}
                </Field>

                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={isSubmitting}
                  block
                >
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>
              </Space>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default LoginPage;
