
const config = {
    openAIApiKey: process.env.OPEN_AI_API_KEY,
    prompt: 'in the following statement check if a high rank Hamas operative was killed and return just its name and role, ' +
        'if you find he name answer with the name only and if you didnt find, return the text not found only without explanations',

    personalPhoneNumber: process.env.PERSONAL_PHONE_NUMBER,

    TDLibApi_id: process.env.TDLIB_API_ID,
    TDLibApi_hash: process.env.TDLIB_API_HASH,

    ourGroupIdContainingTheBot: -4032784514, // Good Guys Down public group id
    channelsToListenTo: [
        '1727761169', // קבוצה
        '1725562716', // חדשות לפני כולם בטלגרם
        '1944652421', // אלמוג בוקר
        '1406113886', // חדשות מהשטח בטלגרם
        '1613161072', // דניאל עמרם
    ],
};

module.exports = config;
