
const config = require('./config');
const telegramBot = require('./bot.service');
const openaiService = require('./openai.service');

function processMessages(messages = []) { // messages: [ messageText: string, channelId: number ]
    if (!messages || !messages.length) {
        return;
    }

    messages
        .filter((message) => config.channelsToListenTo.includes(message.channelId))
        .forEach((message) => processMessage(message));
}

async function processMessage({ messageText: originalMessageText }) { // message: { messageText: string, channelId: number }
    const chatResponse = await openaiService.checkText(originalMessageText);
    const logBody = `\n[originalMessageText]: ${originalMessageText},\n[chatResponse]: ${chatResponse}`;
    if (chatResponse && chatResponse.toLowerCase().includes('not found')) {
        const messageText = `nothing found for:\n${logBody}`;
        console.log(messageText);
    } else {
        const messageText = `a new good guy is down:\n${chatResponse}`;
        console.log(messageText);
        await telegramBot.sendMessageToOurGroup(messageText);
    }
}

module.exports = {
    processMessages,
}
