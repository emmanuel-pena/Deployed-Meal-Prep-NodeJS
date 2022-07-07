/* eslint-disable max-len */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const user = require('./user');
const auth = require('./auth');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend/build')));
app.use(express.urlencoded({ extended: false }));


app.post('/login', user.authenticateUser);
app.post('/resend_verification', user.resendVerification);
app.post('/google-login', auth.googleAuth);
app.post('/verify', auth.checkRegistraionToken, user.emailVerification);
app.post('/forgotPassword', user.sendResetPassword);
app.post('/resetPassword', auth.checkResetPasswordToken, user.resetPassword);

// public API endspoints go here ----
app.post('/user', user.createUser);

app.post('/favoriterecipe', auth.checkAccessToken, user.addToFavorites);
app.get('/favoriterecipe', auth.checkAccessToken, user.getAllFromFavorites);
app.delete('/favoriterecipe', auth.checkAccessToken, user.deleteFromFavorites);

app.post('/grocerylists', auth.checkAccessToken, user.addGroceryList);
app.get('/grocerylists', auth.checkAccessToken, user.getGroceryLists);
app.delete('/grocerylists', auth.checkAccessToken, user.deleteGroceryList);

app.post('/groceryrecipe', auth.checkAccessToken, user.addToNewGroceryList);
app.post('/groceryrecipeexisting', auth.checkAccessToken, user.addToExistingGroceryList);
app.get('/groceryrecipe', auth.checkAccessToken, user.getAllFromGroceryList);
app.delete('/groceryrecipe', auth.checkAccessToken, user.deleteFromGroceryList);

app.post('/calendarrecipe', auth.checkAccessToken, user.addToMealCalendarTable);
app.get('/calendarrecipe', auth.checkAccessToken, user.getFromMealCalendarTable);
app.delete('/calendarrecipe', auth.checkAccessToken, user.deleteFromMealCalendarTable);

app.get('/recipesandlistnames', auth.checkAccessToken, user.getRecipesAndListNames);

app.use((err, req, res, next) => {
  res.status(err.status).json({
    message: err.message,
    errors: err.errors,
    status: err.status,
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
});

app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log(`Server Running on port ${process.env.PORT || 3000}`);
  console.log('API Testing UI: http://localhost:3010/v0/api-docs/');
});
