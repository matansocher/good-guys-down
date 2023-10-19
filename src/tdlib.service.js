const path = require('path');
const MTProto = require('@mtproto/core');
const { getSRPParams } = require('@mtproto/core');
const prompts = require('prompts');
const controller = require('./controller');
const config = require('./config');

const api_id = config.TDLibApi_id; // insert api_id here
const api_hash = config.TDLibApi_hash; // insert api_hash here

const mtproto = new MTProto({
    api_id,
    api_hash,
    storageOptions: {
        path: path.resolve(__dirname, './data/1.json'),
    },
});

function startListener() {
    console.log('[+] starting listener');
    mtproto.updates.on('updates', ({ updates }) => {
        const newChannelMessages = updates.filter((update) => update._ === 'updateNewChannelMessage' || update._ === 'updateNewMessage').map(({ message }) => message) // filter `updateNewChannelMessage` types only and extract the 'message' object
        const parsedMessages = [];
        for (const message of newChannelMessages) {
            const channelId = message.peer_id.channel_id;
            const messageText = message.message;
            if (channelId && messageText) {
                console.log(`[${channelId}]: ${messageText}`);
                parsedMessages.push({ channelId, messageText });
            }
        }
        controller.processMessages(parsedMessages);
    });
}

async function handleLogin(error) {
    // The user is not logged in
    console.log('[+] You must log in')
    const phone_number = config.personalPhoneNumber;

    mtproto.call('auth.sendCode', {
        phone_number: phone_number,
        settings: {
            _: 'codeSettings',
        },
    })
        .catch(error => {
            console.log('failed to fetch code for phone number');
        })
        .then(async result => {
            const phone_code = await getCode();
            const phone_code_hash = result.phone_code_hash;
            return mtproto.call('auth.signIn', {
                phone_code,
                phone_number,
                phone_code_hash,
            });
        })
        .catch(error => {
            console.log('failed to verify code for phone number');
        })
        .then(result => {
            console.log('[+] successfully authenticated');
            // start listener since the user has logged in now
            startListener();
        });
}

async function getPhone() {
    return (await prompts({
        type: 'text',
        name: 'phone',
        message: 'Enter your phone number:'
    })).phone
}

async function getCode() {
    // you can implement your code fetching strategy here
    return (await prompts({
        type: 'text',
        name: 'code',
        message: 'Enter the code sent:',
    })).code
}

async function getPassword() {
    return (await prompts({
        type: 'text',
        name: 'password',
        message: 'Enter Password:',
    })).password
}

// checking authentication status
mtproto
    .call('users.getFullUser', { id: { _: 'inputUserSelf' } })
    .then(startListener) // means the user is logged in -> so start the listener
    .catch(handleLogin);
