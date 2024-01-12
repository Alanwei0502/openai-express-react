import React, { useEffect, useRef, useState } from 'react';
import './Chatbox.css';

enum Role {
  user = 'user',
  bot = 'bot'
}

interface IMessage {
  role: Role;
  content: string;
}

interface IChatBoxProps {
}

const ChatBox: React.FC<IChatBoxProps> = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScroll, setIsAutoScroll] = useState<boolean>(true);
  const [messages, setMessages] = useState<IMessage[]>([]);

  const handleScroll = () => {
    const messagesBox = scrollRef.current;
    if (messagesBox) {
      const isAtBottom = messagesBox.scrollHeight - messagesBox.scrollTop === messagesBox.clientHeight;
      setIsAutoScroll(isAtBottom);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const valueString = JSON.stringify(e.target.value);
    const countNewlines = (valueString.match(/\\n/g) || []).length;
    e.target.rows = countNewlines + 1;
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isEnter = e.key === 'Enter';
    const hasShiftKey = e.shiftKey;
    if (!textareaRef.current) return;

    if (isEnter && !hasShiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const handleSubmit = async () => {
    try {
      if (!textareaRef.current) return;
      const prompt = textareaRef.current?.value ?? '';
      textareaRef.current.value = '';
      textareaRef.current.rows = 1;
      if (!prompt.trim()) return;

      setMessages(prevMessages => [...prevMessages, { role: Role.user, content: prompt }]);

      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok || !response.body) {
        throw response.statusText;
      }

      // 準備接收 streaming data
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let loopRunner = true;
      while (loopRunner) {
        // 讀取 streaming data，直到結束
        const { value, done } = await reader.read();
        if (done) {
          loopRunner = false;
          break;
        }
        const decodedChunk = decoder.decode(value, { stream: true });
        setMessages(prevMessages => {
          // 接收到每一個chunk，就更新state
          let newAnswer = '';
          const lastMessage = prevMessages[prevMessages.length - 1];
          const isLastMessageFromBot = lastMessage.role === Role.bot;
          if (isLastMessageFromBot) {
            newAnswer = lastMessage.content + decodedChunk;
            return [...prevMessages.slice(0, -1), { role: Role.bot, content: newAnswer }];
          } else {
            newAnswer = decodedChunk;
            return [...prevMessages, { role: Role.bot, content: newAnswer }];
          }
        });
      }

    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const messagesBox = scrollRef.current;
    if (!messagesBox) return;

    if (isAutoScroll) {
      messagesBox.scrollTo({
        top: messagesBox.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [isAutoScroll, messages]);

  return (
    <div className="chatbox">
      <div className="messages" ref={scrollRef} onScroll={handleScroll}>
        {messages.map(({ role, content }, i) => (
          <div key={i} className={`message-area ${role}`}>
            <div className="avatar" />
            <div className="message">{content}</div>
          </div>
        ))}
      </div>
      <form className='user-input-area' onSubmit={handleSubmit}>
        <textarea className='textarea' placeholder='ask something...' ref={textareaRef} onKeyDown={handleKeyDown} onChange={handleChange} rows={1} />
        <button className="submit-button" type='submit'>Submit</button>
      </form>
    </div>
  );
};

export default ChatBox;
