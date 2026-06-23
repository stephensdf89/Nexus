import tiktok from "./triggers/tiktok.js";
import youtube from "./triggers/youtube.js";
import discord from "./triggers/discord.js";
import schedule from "./triggers/schedule.js";
import webhook from "./triggers/webhook.js";

import sendDiscord from "./actions/sendDiscord.js";
import sendWebhook from "./actions/sendWebhook.js";
import postComment from "./actions/postComment.js";
import updateDB from "./actions/updateDB.js";

import keywordMatch from "./conditions/keywordMatch.js";
import followerThreshold from "./conditions/followerThreshold.js";

export const triggers = {
  tiktok,
  youtube,
  discord,
  schedule,
  webhook,
};

export const actions = {
  sendDiscord,
  sendWebhook,
  postComment,
  updateDB,
};

export const conditions = {
  keywordMatch,
  followerThreshold,
};
