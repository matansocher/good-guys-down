const TelegramBot = require('node-telegram-bot-api');
// const bot = new TelegramBot(process.env.TELEGRAM_BOT_API_TOKEN, { polling: true });
const bot = new TelegramBot(process.env.TELEGRAM_BOT_API_KEY, { polling: true });
const config = require('./config');
const { get: _get } = require('lodash');

// bot.onText(/\/start/, async (message, match) => {
//     const { chatId } = getMessageData(message);
//     const messageText = '';
//     await bot.sendMessage(chatId, messageText);
// });

let tempCode = '';

bot.on('message', async (msg) => {
    const { chatId, firstName, lastName, text: messageText } = getMessageData(msg);

    const logBody = `chatId: ${chatId}, firstname: ${firstName}, lastname: ${lastName}, messageText: ${messageText}`;
    console.log(`${logBody} - start`);

    try {
        // const messageText = 'aaa';
        // await bot.sendMessage(chatId, messageText);
        //
        if (messageText.includes('pass')) {
            tempCode = messageText.replace('pass', '').trim();
        }
        console.log(`${logBody} - success`);
    } catch (err) {
        console.error(`${logBody} - error - ${JSON.stringify(err)}`);
        await bot.sendMessage(chatId, `Sorry, but something went wrong`);
    }
});

function getMessageData(message) {
    return {
        chatId: _get(message, 'chat.id', ''),
        text: _get(message, 'text', '').toLowerCase(),
        date: _get(message, 'date', ''),
        firstName: _get(message, 'from.first_name', ''),
        lastName: _get(message, 'from.last_name', ''),
    };
}

function getTempCode() {
    return tempCode;
}

async function sendMessageToOurGroup(messageText) {
    try {
        await bot.sendMessage(config.ourGroupIdContainingTheBot, messageText);
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    sendMessageToOurGroup,
    getTempCode
};
