import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import apiRouter from './routes';
import errorMiddleware from './middlewares/error.middleware';

const app = express();

app.use(cors({
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/');
app.use('/api', apiRouter);
app.use(errorMiddleware);

const port = process.env.PORT || 3000;
app.listen(process.env.PORT, () => {
  console.log(`The server is running on port ${port}`);
});
