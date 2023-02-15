const core = require('@actions/core');
const axios = require('axios');

main();

async function main() {
    const env = process.env;
    const type = env.INPUT_type;
    const message = env.INPUT_message;
    const webhook = env.INPUT_webhook;
    console.log(type);

    console.log(type, message, webhook);
    if (type === undefined || message === undefined || webhook === undefined) {
        console.log('Invalid parameters');
        core.setFailed();
        return -1;
    }
    if (type === 'new-issue') {
        let issueMeta = {};
        try {
            issueMeta = JSON.parse(message);
            if (!issueMeta.hasOwnProperty('title') ||
                !issueMeta.hasOwnProperty('issueName') ||
                !issueMeta.hasOwnProperty('issueLink') ||
                !issueMeta.hasOwnProperty('issueNumber')) {
                console.log('Invalid message');
                core.setFailed();
                return -1;
            }
        } catch (ex) {
            console.log('Invalid message');
            core.setFailed();
            return -1;
        }
        const data = {
            "@type": "MessageCard",
            "@context": "http://schema.org/extensions",
            "themeColor": "0076D7",
            "summary": "A new important issue is created",
            "sections": [{
                "activityTitle": issueMeta['title'],
                "facts": [{
                    "name": "Issue title",
                    "value": issueMeta['issueName']
                }, {
                    "name": "Issue number",
                    "value": "#" + issueMeta['issueNumber']
                }, {
                    "name": "Issue link",
                    "value": issueMeta['issueLink']
                }],
                "markdown": true
            }]
        };
        try {
            const response = await axios.post(webhook, data);
            if (response.status !== 200 || response.data !== 1) {
                console.log('Failed to send message');
                core.setFailed();
                return -1;
            }
        } catch (ex) {
            console.log(ex);
            core.setFailed();
            return -1;
        }
    } else if (type === 'daily-report') {
        
    } else {
        console.log('Invalid type');
        core.setFailed();
        return -1;
    }
    return 0;
}