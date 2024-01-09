import { Request, Response, NextFunction } from 'express';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

//These arrays are to maintain the history of the conversation
const conversationContext: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
  [{ role: 'system', content: 'You are a helpful assistant.' }];

class ChatController {
  public static async generateOpenAIChat(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { prompt } = req.body;
      conversationContext.push({ role: 'user', content: prompt });

      const params: OpenAI.Chat.ChatCompletionCreateParamsStreaming = {
        model: 'gpt-3.5-turbo',
        messages: conversationContext,
        stream: true,
      };

      const stream = openai.beta.chat.completions.stream(params);

      for await (const part of stream) {
        if (part.choices[0].finish_reason === "stop") {
          const chatCompletion = await stream.finalChatCompletion();
          conversationContext.push(chatCompletion.choices[0].message);
          res.end();
          return;
        }
        res.write(part.choices[0]?.delta?.content || "");
      }
    } catch (err) {
      if (err instanceof OpenAI.APIError) {
        return res.status(err.status || 500).json({
          success: false,
          message: err.message,
        });
      } else {
        throw err;
      }
    }
  }
}

export default ChatController;
