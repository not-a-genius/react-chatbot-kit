import React, { useEffect, useState } from 'react';
import ConditionallyRender from 'react-conditionally-render';

import ChatbotMessageAvatar from './ChatBotMessageAvatar/ChatbotMessageAvatar';
import Loader from '../Loader/Loader';

import './ChatbotMessage.css';
import { callIfExists } from '../Chat/chatUtils';
import { ICustomComponents, ICustomStyles } from '../../interfaces/IConfig';

import IconButton from "@mui/material/IconButton";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { Stack } from '@mui/material';

import axios, { AxiosResponse, AxiosError } from 'axios';




interface IChatbotMessageProps {
  message: string;
  withAvatar?: boolean;
  loading?: boolean;
  messages: any[];
  delay?: number;
  id: number;
  setState?: React.Dispatch<React.SetStateAction<any>>;
  customComponents?: ICustomComponents;
  customStyles: { backgroundColor: string };
  onThumbUpClick?: () => void;
  onThumbDownClick?: () => void;
  isFixedMessage?: boolean;
  beUserMessageId?: number;
  beBotMessageId?: number;
  chatSessionId?: number;
  patchUrl?: string;
}
const ChatbotMessage = ({
  message,
  withAvatar = true,
  loading,
  messages,
  customComponents,
  setState,
  customStyles,
  delay,
  id,
  onThumbUpClick,
  onThumbDownClick,
  isFixedMessage,
  beUserMessageId,
  beBotMessageId,
  chatSessionId,
  patchUrl,
}: IChatbotMessageProps) => {
  const [show, toggleShow] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);
  const [thumbsDownClicked, setThumbsDownClicked] = useState(false);
  const [thumbsInteractionCount, setThumbsInteractionCount] = useState(0);
  const [nbeBotMessageId, setBeBotMessageId] = useState(beBotMessageId);
      
  useEffect(() => {
    let timeoutId: any;
    const disableLoading = (
      messages: any[],
      setState: React.Dispatch<React.SetStateAction<any>>
    ) => {
      let defaultDisableTime = 750;
      if (delay) defaultDisableTime += delay;

      timeoutId = setTimeout(() => {
        const newMessages = [...messages];
        const message = newMessages.find((message) => message.id === id);

        if (!message) return;
        message.loading = false;
        message.delay = undefined;

        setState((state: any) => {
          const freshMessages = state.messages;
          const messageIdx = freshMessages.findIndex(
            (message: any) => message.id === id
          );
          freshMessages[messageIdx] = message;

          return { ...state, messages: freshMessages };
        });
      }, defaultDisableTime);
    };

    disableLoading(messages, setState);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [delay, id]);

  useEffect(() => {
    if (delay) {
      setTimeout(() => toggleShow(true), delay);
    } else {
      toggleShow(true);
    }
  }, [delay]);

  const chatBoxCustomStyles = { backgroundColor: '' };
  const arrowCustomStyles = { borderRightColor: '' };

  if (customStyles) {
    chatBoxCustomStyles.backgroundColor = customStyles.backgroundColor;
    arrowCustomStyles.borderRightColor = customStyles.backgroundColor;
  }

  interface botMessageData {
    user_message_id: number;
    chat_id: number;
    content: string;
    bot_message_id: number;
    thumbsUp?: boolean;
  }
  
  const postBotMessageThumb = async (url: string, thumbsUp: boolean) : Promise<void> => {
    console.log('postBotMessageThumb called');
    console.log('url:', url);
    console.log('thumbsUp:', thumbsUp);
    console.log('beBotMessageId:', nbeBotMessageId);
    console.log('beUserMessageId:', beUserMessageId);
    console.log('chatSessionId:', chatSessionId);
    
    try {
      const data: botMessageData = {
        user_message_id: beUserMessageId,
        chat_id: chatSessionId,
        content: message,
        bot_message_id: beBotMessageId,
        thumbsUp: thumbsUp
      };
      if(nbeBotMessageId === undefined) {
         await axios.post(url, data).then((response) => {
          setBeBotMessageId(response.data.bot_message_id);
          console.log('Send successfully post data to:', url, response.data);
        });

      }
      else {
        const response: AxiosResponse = await axios.patch(url, data);
        console.log('Send successfully patch data to:', url, response.data);
    }
    } catch (error: any) {
      console.error('Error in postBotMessageThumb to:', url, error.message);
    }
  };

  

  useEffect(() => {
    if (thumbsUpClicked) {
      postBotMessageThumb(patchUrl!, true);
      if (onThumbUpClick) {
        onThumbUpClick();
      }
    }
    else if (thumbsDownClicked) {
      postBotMessageThumb(patchUrl!, false);
      if (onThumbDownClick) { 
        onThumbDownClick();
      }
    }
    else if (thumbsInteractionCount > 0 && !thumbsUpClicked && !thumbsDownClicked) {
      postBotMessageThumb(patchUrl!, null);
    }
  }, [thumbsUpClicked, thumbsDownClicked]);

  return (
    <ConditionallyRender
      condition={show}
      show={
        <div className="react-chatbot-kit-chat-bot-message-container">
          <ConditionallyRender
            condition={withAvatar}
            show={
              <ConditionallyRender
                condition={!!customComponents?.botAvatar}
                show={callIfExists(customComponents?.botAvatar)}
                elseShow={<ChatbotMessageAvatar />}
              />
            }
          />

          <ConditionallyRender
            condition={!!customComponents?.botChatMessage}
            show={callIfExists(customComponents?.botChatMessage, {
              message,
              loader: <Loader />,
            })}
            elseShow={
              <div
                className="react-chatbot-kit-chat-bot-message"
                style={chatBoxCustomStyles}
              >
                <ConditionallyRender
                  condition={loading}
                  show={<Loader />}
                  elseShow={<span>{message}</span>}
                />
                <ConditionallyRender
                  condition={withAvatar}
                  show={
                    <div
                      className="react-chatbot-kit-chat-bot-message-arrow"
                      style={arrowCustomStyles}
                    ></div>
                  }
                />
              </div>
            }
          />
          {isFixedMessage?'':
          <Stack  className='thumbsContainer'>
            
            <IconButton onClick={() =>{
              setThumbsInteractionCount(thumbsInteractionCount + 1)
              setThumbsUpClicked(!thumbsUpClicked)
              setThumbsDownClicked(false)
              }
            }>
              <ThumbUpIcon style={{fill: "cyan"}} sx={
                { stroke: thumbsUpClicked? "#3d4e8d":"black", strokeWidth: thumbsUpClicked? 2 : 1 }}/>
            </IconButton>

            <IconButton  onClick={ () =>{
              setThumbsInteractionCount(thumbsInteractionCount + 1)
              setThumbsDownClicked(!thumbsDownClicked)
              setThumbsUpClicked(false)
              postBotMessageThumb(patchUrl, thumbsDownClicked? false : null)
              }
            }>
              <ThumbDownIcon style={{fill: "darkgrey"}} sx={
                { stroke: thumbsDownClicked? "#3d4e8d":"black", strokeWidth: thumbsDownClicked? 2 : 1 }}/>
            </IconButton>

          </Stack> 
      }
        </div>
      }
    />
    
  );
};

export default ChatbotMessage;
