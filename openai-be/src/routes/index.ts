import { Router } from 'express';
import chatRouter from './chat.router';

const apiRouter = Router();

apiRouter.use('/chat', chatRouter);

export default apiRouter;
