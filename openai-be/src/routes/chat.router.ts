import { Router } from 'express';
import ChatController from '../controllers/chat.controller';

const chatRouter = Router();

chatRouter.post('/', ChatController.generateOpenAIChat);

export default chatRouter;
