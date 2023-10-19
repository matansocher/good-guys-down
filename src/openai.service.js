const OpenAI = require('openai');
const config = require('./config');

const openai = new OpenAI({
    apiKey: config.openAIApiKey, // defaults to process.env['OPENAI_API_KEY']
});

async function checkText(text) {
    try {
        const prompt = `${config.prompt}: ${text}`;
        const chatCompletion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-3.5-turbo',
        });

        const chatResponse = chatCompletion.choices[0].message.content;
        return chatResponse;
    } catch (e) {
        console.log('no response from openai');
        return 'Not found';
    }
}

module.exports = {
    checkText,
};
