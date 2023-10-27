
const config = require('./config');
const telegramBot = require('./bot.service');
const openaiService = require('./openai.service');

function processMessages(messages = []) { // messages: [ messageText: string, channelId: number, fromChannelName: string ]
    if (!messages || !messages.length) {
        return;
    }

    const channelsIdsToListenTo = config.channelsToListenTo.map(channel => channel.channelId);
    messages
        .filter((message) => channelsIdsToListenTo.includes(message.channelId))
        .forEach((message) => processMessage(message));
}

async function processMessage({ messageText: originalMessageText, fromChannelName }) { // message: { messageText: string, channelId: number }
    const chatResponse = await openaiService.checkText(originalMessageText);
    if (chatResponse && chatResponse.toLowerCase().includes('not')) {
        const logBody = `\n[fromChannelName]: ${fromChannelName},\n[originalMessageText]: ${originalMessageText},\n[chatResponse]: ${chatResponse}`;
        const messageText = `nothing found for:\n${logBody}`;
        console.log(messageText);
    } else {
        const messageText = `a new good guy is down:\n${chatResponse}\nfrom: ${fromChannelName}`;
        console.log(messageText);
        await telegramBot.sendMessageToOurGroup(messageText);
    }
}

module.exports = {
    processMessages,
}
