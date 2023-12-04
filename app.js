const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense');
const purchaseRoutes = require('./routes/purchase');
const premiumRoute = require('./routes/premiumFeature');
const passwordRoutes = require('./routes/password');

require('dotenv').config();
const app = express();
app.use(cors({
    origin: "*"
}));
app.use(bodyParser.json({ extended: false }));

app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumRoute);
app.use('/password', passwordRoutes);

app.use((req, res) => {
    if(req.url == '/'){
        res.sendFile(path.join(__dirname, 'views','login','login.html'))
    }
    else{
        res.sendFile(path.join(__dirname, `views/${req.url}`))
    }
})

mongoose.connect('mongodb+srv://shubham99sp:nmK4GmXNXdLyQJ7H@cluster0.ccyqktc.mongodb.net/expense')
    .then(() => {
        console.log('Connected!')
        app.listen(process.env.PORT || 3000);
    })
    .catch(err => console.log('Error at sequelize.sync()', err))