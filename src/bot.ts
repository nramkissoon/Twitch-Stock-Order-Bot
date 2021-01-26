import { client, ChatUserstate } from 'tmi.js'
import { config } from 'dotenv'
import { processMessage } from './messageProcessing'
import { publishToSNS } from './sns'
import { log } from './logging'
import AsyncLock from 'async-lock'
import AWS from 'aws-sdk'

// retrieve configuration values
config()

// configure aws
AWS.config.update({ region: 'us-east-1' })
const SNSTopicArn = process.env.SNS_TOPIC_ARN

// define market hours where orders are valid
const startTime = 9 * 60 + 30
const endTime = 15 * 60 + 59

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
const bot = client(clientOptions);

// Register our event handlers (defined below)
bot.on('message', onMessageHandler);
bot.on('connected', onConnectedHandler);
bot.on('disconnected', () => { bot.connect() })
bot.on('ping', () => {
})
bot.on('pong', () => {
})

// Connect to Twitch:
bot.connect().catch(err => { log(err); });

// queue of orders to be sent
let orderQ = [];

// lock for ensuring only either enqueuing or publishing is happening on the order queue
const orderQLock: AsyncLock = new AsyncLock();
const lockKey = 'key';

// Called every time a message comes in
function onMessageHandler (target, context: ChatUserstate, msg: string, self) {
  if (self) { return; } // Ignore messages from the bot
  
  const date = new Date()
  const now = date.getHours() * 60 + date.getMinutes();
  if (startTime > now || now > endTime) { return; } // markets not open

  // process message
  const message = msg.trim();
  orderQLock.acquire(lockKey, (done) => {
    processMessage(message, context, orderQ);
    done();
  });
  
}

function publishBulk() {
  if (orderQ.length > 0) {
    orderQLock.acquire(lockKey, (done) => {
      publishToSNS(SNSTopicArn, JSON.stringify(orderQ));
      orderQ = [];
      done();
    });
  }
}

setInterval(publishBulk, 2000);

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  log(`* Connected to ${addr}:${port}`);
}