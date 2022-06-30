require('dotenv').config();
require('express-async-errors');

//express
const express = require('express');
const app = express();

//package
const cors = require('cors')

//router
const authRouter = require('./routes/auth.route')

//middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRouter)

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`server is listening on port ${port}`);
})