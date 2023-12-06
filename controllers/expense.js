const Expense = require('../models/expense');
const User = require('../models/user');

exports.getExpense = async (req, res, next) => {
    try {
        const limit = +req.query.pagesize;
        const page = +req.query.page || 1;
        const offset = limit * (page - 1);

        const expensePromise = await Expense.find({ userId: req.user._id })
            .limit(limit)
            .skip(offset)

        const countDocs = await Expense.countDocuments({ userId: req.user._id })

        Promise.all([expensePromise, countDocs])
            .then(([expenses, count]) => {
                res.status(200).json({
                    expenses: expenses,
                    currPage: page,
                    hasNextPage: limit * page < count,
                    nextPage: page + 1,
                    hasPrevPage: page > 1,
                    prevPage: page - 1,
                    lastpage: Math.ceil(count / limit),
                });
            })

    }
    catch (error) {
        res.status(404).json({ error });
    }
}

exports.addExpense = async (req, res, next) => {
    try {
        const { amount, description, category, date } = req.body;
        const newExpense = new Expense({
            amount: amount,
            description: description,
            category: category,
            date: date,
            userId: req.user
        })

        await newExpense.save();

        const user = await User.findById({ _id: req.user._id })
        user.totalExpense = +user.totalExpense + +amount

        await user.save();
        res.status(200).json({ message: 'expense added', newExpense });
    }
    catch (err) {
        res.status(500).json({ error: err });
    }
}

exports.deleteExpense = async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!id) {
            throw new Error('Expense not found')
        }
        const expense = await Expense.findByIdAndDelete({ _id: id });

        const amount = expense.amount;

        const user = await User.findById({ _id: req.user._id });
        user.totalExpense = user.totalExpense - amount;

        await user.save()

        res.status(200).json({ messege: 'expense deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ err: error, message: 'expense not found' });
    }
}

exports.editExpense = async (req, res, next) => {
    try {
        const id = req.params.id;

        const { amount, description, category } = req.body;
        const user = await User.findById({ _id: req.user._id });
        const expense = await Expense.findById({ _id: id });

        if (expense) {
            const oldAmount = expense.amount;
            expense.amount = amount;
            expense.description = description;
            expense.category = category;

            await expense.save();

            user.totalExpense = +user.totalExpense - +oldAmount + +amount;
            await user.save();

            res.status(200).json({ message: 'Expense Updated Successfully' })
        }
        else {
            throw new Error('Error at update expense controller')
        }
    }
    catch (error) {
        res.status(404).json({ message: 'Expense Not found' });
    }
}