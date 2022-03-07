import { Button, Box, IconButton, TextField, Typography } from '@mui/material';
import React, { useState, createRef, useEffect, useReducer } from 'react';
import Gun from 'gun';
import MessageInput from './MessageInput';
import SenderMessage from './SenderMessage';
import RecipientMessage from './RecipientMessage';
import { useEthereum } from '@decentology/hyperverse-ethereum';

const gun = Gun();

const initialChatState = {
  messages: [],
};

const GUN_DB_ID = process.env.NEXT_PUBLIC_GUN_DB;

function chatReducer(state, action) {
  switch (action.type) {
    case 'SEND_MESSAGE':
      if (!action.payload.sender || !action.payload.recipient) {
        return state;
      }
      return {
        messages: [action.payload, ...state.messages],
      };
    default:
      throw new Error(`Invalid action type: ${action.type}`);
  }
}

export default function Chat({ targetAddress }) {
  const messageRef = createRef();
  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  const { address } = useEthereum();
  const addresses = [address, targetAddress];

  useEffect(() => {
    gun
      .get(GUN_DB_ID)
      .map()
      .on((msg) => {
        if (
          addresses.includes(msg.sender) &&
          addresses.includes(msg.recipient)
        ) {
          dispatch({
            type: 'SEND_MESSAGE',
            payload: {
              sender: msg.sender,
              recipient: msg.recipient,
              message: msg.message,
              created: msg.created,
            },
          });
        }
      });
  }, [address]);

  const sendMessage = () => {
    if (!messageRef.current.value || !address) {
      return;
    }

    gun.get(GUN_DB_ID).set({
      sender: address,
      recipient: targetAddress,
      message: messageRef.current.value,
      created: Date.now(),
    });
    messageRef.current.value = '';
  };

  return (
    <>
      <Typography variant="h5">Messages</Typography>
      <Box
        id="messages"
        sx={{
          height: '70vh',
          width: '100%',
          overflow: 'auto',
          marginBottom: 2,
          marginTop: 2,
        }}
      >
        {state.messages.map((msg) => {
          if (msg.sender == address) {
            return (
              <SenderMessage message={msg.message} created={msg.created} />
            );
          }
          return (
            <RecipientMessage
              message={msg.message}
              name={msg.sender}
              created={msg.created}
            />
          );
        })}
      </Box>
      <MessageInput inputRef={messageRef} sendMessage={sendMessage} />
    </>
  );
}
