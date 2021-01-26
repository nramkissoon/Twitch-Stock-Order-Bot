"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tmi_js_1 = require("tmi.js");
const dotenv_1 = require("dotenv");
const messageProcessing_1 = require("./messageProcessing");
const sns_1 = require("./sns");
const logging_1 = require("./logging");
const async_lock_1 = __importDefault(require("async-lock"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
// retrieve configuration values
dotenv_1.config();
// configure aws
aws_sdk_1.default.config.update({ region: 'us-east-1' });
const SNSTopicArn = process.env.SNS_TOPIC_ARN;
// define market hours where orders are valid
const startTime = 9 * 60 + 30;
const endTime = 15 * 60 + 59;
// Define configuration options for client
const clientOptions = {
    identity: {
        username: process.env.USERNAME,
        password: process.env.PASSWORD
    },
    channels: [
        process.env.CHANNEL
    ],
    connection: {
        reconnect: true
    }
};
// Create the bot
const bot = tmi_js_1.client(clientOptions);
// Register our event handlers (defined below)
bot.on('message', onMessageHandler);
bot.on('connected', onConnectedHandler);
bot.on('disconnected', () => { bot.connect(); });
bot.on('ping', () => {
});
bot.on('pong', () => {
});
// Connect to Twitch:
bot.connect().catch(err => { logging_1.log(err); });
// queue of orders to be sent
let orderQ = [];
// lock for ensuring only either enqueuing or publishing is happening on the order queue
const orderQLock = new async_lock_1.default();
const lockKey = 'key';
// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {
    if (self) {
        return;
    } // Ignore messages from the bot
    const date = new Date();
    const now = date.getHours() * 60 + date.getMinutes();
    if (startTime > now || now > endTime) {
        return;
    } // markets not open
    // process message
    const message = msg.trim();
    orderQLock.acquire(lockKey, (done) => {
        messageProcessing_1.processMessage(message, context, orderQ);
        done();
    });
}
function publishBulk() {
    if (orderQ.length > 0) {
        orderQLock.acquire(lockKey, (done) => {
            sns_1.publishToSNS(SNSTopicArn, JSON.stringify(orderQ));
            orderQ = [];
            done();
        });
    }
}
setInterval(publishBulk, 2000);
// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
    logging_1.log(`* Connected to ${addr}:${port}`);
}
//# sourceMappingURL=bot.js.map