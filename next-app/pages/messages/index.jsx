import { useEthereum } from '@decentology/hyperverse-ethereum';
import { useRouter } from 'next/router';
import { useEffect, useReducer, useState } from 'react';
import { toast } from 'react-toastify';
import Gun from 'gun';
import {
  Box,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
} from '@mui/material';
import { AccountCircle, Message } from '@mui/icons-material';
import Link from 'next/link';

const gun = Gun();

const initialChatState = {
  addresses: [],
};

const GUN_DB_ID = process.env.NEXT_PUBLIC_GUN_DB;

function messagesReducer(state, action) {
  switch (action.type) {
    case 'DIRECT_MESSAGE':
      console.log('reducer', action.payload.address, state.addresses);
      if (
        action.payload.address &&
        !state.addresses.includes(action.payload.address)
      ) {
        return {
          addresses: [...state.addresses, action.payload.address],
        };
      }
      return state;
    default:
      throw new Error(`Invalid action type: ${action.type}`);
  }
}

const Messages = () => {
  const { address } = useEthereum();
  const router = useRouter();
  const [state, dispatch] = useReducer(messagesReducer, initialChatState);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!address) {
      toast('You must connect your wallet to message');
    }
    gun
      .get(GUN_DB_ID)
      .map()
      .on((msg) => {
        console.log(address);
        if (msg.sender == address || msg.recipient == address) {
          console.log(msg.sender, msg.recipient);
          dispatch({
            type: 'DIRECT_MESSAGE',
            payload: {
              address: msg.sender == address ? msg.recipient : msg.address,
            },
          });
        } else {
          console.log(msg);
        }
      });
  }, []);

  const onChange = (e) => {
    setText(e.target.value);
  };

  const newMessage = () => {
    router.push(`/messages/${text}`);
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'grey.50',
        }}
      >
        <List sx={{ width: '100%' }}>
          {state.addresses.map((a) => (
            <ListItem key={a} disablePadding>
              <Link href={`/messages/${a}`} passHref>
                <ListItemButton component="a">
                  <ListItemIcon>
                    <AccountCircle />
                  </ListItemIcon>
                  <ListItemText primary={a} />
                </ListItemButton>
              </Link>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ display: 'flex', width: '100%' }}>
        <TextField
          id="outlined-textarea"
          label="Ethereum Address"
          placeholder="Paste an ethereum address"
          multiline
          onChange={onChange}
          sx={{
            flexGrow: 1,
          }}
        />
        <IconButton
          onClick={newMessage}
          size="large"
          color="primary"
          disabled={text === ''}
        >
          <Message />
        </IconButton>
      </Box>
    </Container>
  );
};

export default Messages;
