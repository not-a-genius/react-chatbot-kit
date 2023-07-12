import React from 'react';

import Chat from '../Chat/Chat';

import ChatbotError from '../ChatbotError/ChatbotError';

import IConfig from '../../interfaces/IConfig';

import {
  getCustomStyles,
  getCustomComponents,
  getBotName,
  getCustomMessages,
  isConstructor,
} from './utils';

import useChatbot from '../../hooks/useChatbot';
import { IMessage } from '../../interfaces/IMessages';
import { createChatBotMessage } from '../..';

interface IChatbotProps {
  actionProvider: any;
  messageParser: any;
  config: IConfig;
  headerText?: string;
  placeholderText?: string;
  saveMessages?: (ref: any) => any;
  messageHistory?: IMessage[] | string;
  validator?: (input: string) => Boolean;
  runInitialMessagesWithHistory?: Boolean;
  disableScrollToBottom?: boolean;
  onThumbUpClick?: () => void;
  onThumbDownClick?: () => void;
  patchUrl?: string;
  chatSessionId: number;
}

const Chatbot = ({
  actionProvider,
  messageParser,
  config,
  headerText,
  placeholderText,
  saveMessages,
  messageHistory,
  runInitialMessagesWithHistory,
  disableScrollToBottom,
  validator,
  onThumbUpClick,
  onThumbDownClick,
  chatSessionId,
  patchUrl,
  ...rest
}: IChatbotProps) => {
  const {
    configurationError,
    invalidPropsError,
    ActionProvider,
    MessageParser,
    widgetRegistry,
    actionProv,
    messagePars,
    state,
    setState,
    setMessageContainerRef,
  } = useChatbot({
    config,
    actionProvider,
    messageParser,
    messageHistory,
    saveMessages,
    runInitialMessagesWithHistory,
    ...rest,
  });

  if (configurationError) {
    return <ChatbotError message={configurationError} />;
  }

  if (invalidPropsError.length) {
    return <ChatbotError message={invalidPropsError} />;
  }

  const customStyles = getCustomStyles(config);
  const customComponents = getCustomComponents(config);
  const botName = getBotName(config);
  const customMessages = getCustomMessages(config);

  if (isConstructor(ActionProvider) && isConstructor(MessageParser)) {
    return (
      <Chat
        state={state}
        setState={setState}
        widgetRegistry={widgetRegistry}
        actionProvider={actionProv}
        messageParser={messagePars}
        customMessages={customMessages}
        customComponents={{ ...customComponents }}
        botName={botName}
        customStyles={{ ...customStyles }}
        headerText={headerText}
        placeholderText={placeholderText}
        setMessageContainerRef={setMessageContainerRef}
        validator={validator}
        messageHistory={messageHistory}
        disableScrollToBottom={disableScrollToBottom}
        onThumbUpClick={onThumbUpClick}
        onThumbDownClick={onThumbDownClick}
        patchUrl={patchUrl}
        chatSessionId={chatSessionId}
      />
    );
  } else {
    return (
      <ActionProvider
        setState={setState}
        createChatBotMessage={createChatBotMessage}
      >
        <MessageParser>
          <Chat
            state={state}
            setState={setState}
            widgetRegistry={widgetRegistry}
            actionProvider={ActionProvider}
            messageParser={MessageParser}
            customMessages={customMessages}
            customComponents={{ ...customComponents }}
            botName={botName}
            customStyles={{ ...customStyles }}
            headerText={headerText}
            placeholderText={placeholderText}
            setMessageContainerRef={setMessageContainerRef}
            validator={validator}
            messageHistory={messageHistory}
            disableScrollToBottom={disableScrollToBottom}
            onThumbUpClick={onThumbUpClick}
            onThumbDownClick={onThumbDownClick}
            patchUrl={patchUrl}
            chatSessionId={chatSessionId}
          />
        </MessageParser>
      </ActionProvider>
    );
  }
};

export default Chatbot;
