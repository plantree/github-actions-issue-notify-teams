const core = require('@actions/core');
const axios = require('axios');

main();

async function main() {
    const env = process.env;
    const type = env.INPUT_TYPE;
    const message = env.INPUT_MESSAGE;
    const webhook = env.INPUT_WEBHOOK;

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
    } else if (type === 'daily-report' || type === 'weekly-report') {
        let issueMeta = {};
        try {
            issueMeta = JSON.parse(message);
            if (!issueMeta.hasOwnProperty('total') ||
                !issueMeta.hasOwnProperty('issueList')) {
                console.log('Invalid message');
                core.setFailed();
                return -1;
            }
        } catch (ex) {
            console.log('Invalid message');
            core.setFailed();
            return -1;
        }
        const total = issueMeta['total'];
        const issueList = issueMeta['issueList'];
        // construct message
        let issueListMessage = '| issue name | issue link | issue tag | issue assignee |\n';
        issueListMessage += '| --- | --- | --- | --- |\n';
        for (let i = 0; i < issueList.length; i++) {
            const issue = issueList[i];
            const tags = issue['issueTags'];
            let tag = tags.join(', ');
            issueListMessage += `| ${issue['issueName']} | ${issue['issueLink']} | ${tag} | ${issue['issueAssignee']} |\n`;
        }
        const summary = type === 'daily-report' ? 'Daily report about issues' : 'Weekly report about issues';
        const data = {
            "@type": "MessageCard",
            "@context": "http://schema.org/extensions",
            "themeColor": "0076D7",
            "summary": summary,
            "sections": [{
                "activityTitle": summary,
                "facts": [{
                    "name": "Total issues",
                    "value": total
                }, {
                    "name": "Issue List",
                    "value": issueListMessage
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
    } else {
        console.log('Invalid type');
        core.setFailed();
        return -1;
    }
    return 0;
}