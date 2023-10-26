const path = require('path');
const MTProto = require('@mtproto/core');
const botService = require('./bot.service');
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

mtproto
    .call('users.getFullUser', { id: { _: 'inputUserSelf' } })
    .then(startListener) // means the user is logged in -> so start the listener
    .catch(handleLogin);

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
            console.log('111111111');
            if (error.error_message.includes('_MIGRATE_')) {
                const [type, nextDcId] = error.error_message.split('_MIGRATE_');

                mtproto.setDefaultDc(+nextDcId);

                return getCode(phone_number);
            }
        })
        .then(async result => {
            console.log('222222222');
            return mtproto.call('auth.signIn', {
                phone_code: await getCode(),
                phone_number: phone_number,
                phone_code_hash: result.phone_code_hash,
            });
        })
        .catch(error => {
            console.log('333333333');
            throw new Error('password needed, failed to start the server');
        })
        .then(result => {
            console.log('444444444');
            console.log('[+] successfully authenticated');
            // start listener since the user has logged in now
            startListener()
        });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getCode() {
    const tempCode = botService.getTempCode();
    if (!tempCode) {
        await sleep(1000);
        return getCode();
    }
    return tempCode;
}

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
