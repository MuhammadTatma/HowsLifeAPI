require('dotenv').config();
require('express-async-errors');

//express
const express = require('express');
const app = express();

//package
const cors = require('cors')

//router
const authRouter = require('./routes/auth.route')
const articleRouter = require('./routes/article.route')
const konselorRouter = require('./routes/konselor.route')
const konsultasiRouter = require('./routes/konsultasi.route')

//middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/articles', articleRouter)
app.use('/api/v1/konselor', konselorRouter)
app.use('/api/v1/konsultasi', konsultasiRouter)

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`server is listening on port ${port}`);
})