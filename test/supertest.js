const supertest = require('supertest');
const { expect } = require('chai');
const express = require('express');
const app = express();

describe('Product Router', () => {
  it('POST /products/new should create a new product', async () => {
    const newProductData = {
      name: 'New Product',
      category: 'New Category',
      description: 'New Description',
      price: 49.99,
      imageUrl: '',
      status: true,
      discount: false,
      availability: true
    };

    const response = await supertest(app)
      .post('/products/new')
      .send(newProductData);

    expect(response.body).to.have.property('payload');
    expect(response.body.payload).to.have.property('name', newProductData.name);
  });

  it('POST /products/:id should update a product', async () => {
    const productId = '66156ed26f61c31db514f576'; //ID DE PRUEBA DESDE MI MONGO
    const updatedProductData = {
      name: 'Updated Product Name',
      category: 'Updated Category',
      description: 'Updated Description',
      price: 99.99,
      imageUrl: '',
      status: true,
      discount: false,
      availability: true
    };

    const response = await supertest(app)
      .post(`/products/${productId}`)
      .send(updatedProductData);

    expect(response.body).to.have.property('payload');
    expect(response.body.payload).to.have.property('name', updatedProductData.name);
  });

  it('POST /products/remove/:id should remove a product', async () => {
    const productId = '66156ed26f61c31db514f576'; //ID DE PRUEBA DESDE MI MONGO
    const response = await supertest(app)
      .post(`/products/remove/${productId}`);

    expect(response.body).to.have.property('message', 'Product removed successfully');
  });
});

describe('Cart Router', () => {
  it('GET /carts/info should return cart information', async () => {
    const response = await supertest(app)
      .get('/carts/info');

    expect(response.body).to.have.property('cartInfo');
  });

  it('POST /carts/agregar should add a product to the cart', async () => {
    const productId = '6615732cd813f7ab607516c1';
    const response = await supertest(app)
      .post('/carts/agregar')
      .send({ productId: productId, quantity: 1 });

    expect(response.body).to.have.property('message', 'Product added to cart successfully');
  });

  it('DELETE /carts/remove/:productId should remove a product from the cart', async () => {
    const productId = '6615732cd813f7ab607516c1'; 
    const response = await supertest(app)
      .delete(`/carts/remove/${productId}`);

    expect(response.body).to.have.property('message', 'Product removed from cart successfully');
  });
});

describe('Session Router', () => {
  it('POST /sessions/login should log in a user', async () => {
    const userData = {
      email: 'user@example.com',
      password: 'password123'
    };
    const response = await supertest(app)
      .post('/sessions/login')
      .send(userData);

    expect(response.body).to.have.property('token');
  });

  it('GET /sessions/logout should log out a user', async () => {
    const response = await supertest(app)
      .get('/sessions/logout');

    expect(response.body).to.have.property('message', 'User logged out successfully');
  });

  it('GET /sessions/user should get user information', async () => {
    const response = await supertest(app)
      .get('/sessions/user');

    expect(response.body).to.have.property('email');
    expect(response.body).to.have.property('role');
  });
});
