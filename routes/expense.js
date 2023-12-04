const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense');
const userAuthenticate = require('../middleware/auth')

router.get('/get-expense', userAuthenticate.authenticate, expenseController.getExpense);
router.post('/add-expense', userAuthenticate.authenticate, expenseController.addExpense);
router.delete('/delete-expense/:id', userAuthenticate.authenticate, expenseController.deleteExpense);
router.put('/edit-expense/:id', userAuthenticate.authenticate, expenseController.editExpense);

module.exports = router;