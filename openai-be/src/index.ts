import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import apiRouter from './routes';
import errorMiddleware from './middlewares/error.middleware';
import corsOptionsDelegate from './config/cors';

const app = express();

app.use(cors(corsOptionsDelegate));

app.get('/healthz', async (_, res) => {
  return res.send(new Date().toISOString() + ' health check');
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRouter);
app.use(errorMiddleware);

const port = process.env.PORT || '8081';
app.listen(process.env.PORT, () => {
  console.log(`The server is running on port ${port}`);
});
