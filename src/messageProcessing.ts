import { REGEX_LIST } from 'stock-market-orders/dist/regex';
import { Badges, ChatUserstate } from 'tmi.js';

export interface UserOrderData {
  order: string,
  username?: string,
  "tmi-sent-ts"?: string,
  id?: string,
  subscriber?: boolean,
  color?: string,
  "user-id"?: string,
  badges?: Badges,
  "display-name"?: string;
}

export const isMessageOrder = (orderRegexList: string[], message: string) => {
  for (let i = 0; i < orderRegexList.length; i += 1) {
    let regex = new RegExp(orderRegexList[i], 'g');
    if (regex.test(message)) return true;
  }

  return false;
}

export const createUserOrderData = (message: string, chatUserState: ChatUserstate ) => {
  const userOrderData: UserOrderData = {
    order: message,
  }
  if (chatUserState.username) userOrderData.username = chatUserState.username;
  if (chatUserState["tmi-sent-ts"]) userOrderData["tmi-sent-ts"] = chatUserState["tmi-sent-ts"];
  if (chatUserState.id) userOrderData.id = chatUserState.id;
  if (chatUserState.subscriber) userOrderData.subscriber = chatUserState.subscriber;
  if (chatUserState.color) userOrderData.color = chatUserState.color;
  if (chatUserState["user-id"]) userOrderData["user-id"] = chatUserState["user-id"];
  if (chatUserState.badges) userOrderData.badges = chatUserState.badges;
  if (chatUserState["display-name"]) userOrderData["display-name"] = chatUserState["display-name"];

  return userOrderData;
}

// runs for each chat message
export const processMessage = (message: string, chatUserState: ChatUserstate, orderQ: string[]) => {
  if (isMessageOrder(REGEX_LIST, message)) {
    const userOrderData: UserOrderData = createUserOrderData(message, chatUserState);
    const snsMessage = JSON.stringify(userOrderData);
    orderQ.push(snsMessage);
  }
  return;
}