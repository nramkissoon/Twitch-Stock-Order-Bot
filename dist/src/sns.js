"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishToSNS = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const logging_1 = require("./logging");
const publishToSNS = (topicARN, message) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        Message: message,
        TopicArn: topicARN
    };
    new aws_sdk_1.default.SNS().publish(params, (err, data) => {
        if (err)
            logging_1.log(`${logging_1.LOG_CONSTANTS.SNS_PUBLISH}${logging_1.LOG_CONSTANTS.COLON} ${err.time}${logging_1.LOG_CONSTANTS.COLON} ${err.message}`);
        if (data)
            logging_1.log(`${logging_1.LOG_CONSTANTS.SNS_PUBLISH}${logging_1.LOG_CONSTANTS.COLON} ${data.MessageId}`);
    });
});
exports.publishToSNS = publishToSNS;
//# sourceMappingURL=sns.js.map