import tiktok from "./triggers/tiktok.js";
import youtube from "./triggers/youtube.js";
import instagram from "./triggers/instagram.js";
import gmail from "./triggers/gmail.js";
import drive from "./triggers/drive.js";
import twitter from "./triggers/twitter.js";
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
  instagram,
  gmail,
  drive,
  twitter,
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
