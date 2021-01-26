"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processMessage = exports.createUserOrderData = exports.isMessageOrder = void 0;
const regex_1 = require("stock-market-orders/dist/regex");
const isMessageOrder = (orderRegexList, message) => {
    for (let i = 0; i < orderRegexList.length; i += 1) {
        let regex = new RegExp(orderRegexList[i], 'g');
        if (regex.test(message))
            return true;
    }
    return false;
};
exports.isMessageOrder = isMessageOrder;
const createUserOrderData = (message, chatUserState) => {
    const userOrderData = {
        order: message,
    };
    if (chatUserState.username)
        userOrderData.username = chatUserState.username;
    if (chatUserState["tmi-sent-ts"])
        userOrderData["tmi-sent-ts"] = chatUserState["tmi-sent-ts"];
    if (chatUserState.id)
        userOrderData.id = chatUserState.id;
    if (chatUserState.subscriber)
        userOrderData.subscriber = chatUserState.subscriber;
    if (chatUserState.color)
        userOrderData.color = chatUserState.color;
    if (chatUserState["user-id"])
        userOrderData["user-id"] = chatUserState["user-id"];
    if (chatUserState.badges)
        userOrderData.badges = chatUserState.badges;
    if (chatUserState["display-name"])
        userOrderData["display-name"] = chatUserState["display-name"];
    return userOrderData;
};
exports.createUserOrderData = createUserOrderData;
// runs for each chat message
const processMessage = (message, chatUserState, orderQ) => {
    if (exports.isMessageOrder(regex_1.REGEX_LIST, message)) {
        const userOrderData = exports.createUserOrderData(message, chatUserState);
        const snsMessage = JSON.stringify(userOrderData);
        orderQ.push(snsMessage);
    }
    return;
};
exports.processMessage = processMessage;
//# sourceMappingURL=messageProcessing.js.map