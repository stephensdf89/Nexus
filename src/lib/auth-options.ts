import FacebookProvider from "next-auth/providers/facebook";
import TwitterProvider from "next-auth/providers/twitter";
import DiscordProvider from "next-auth/providers/discord";
import TwitchProvider from "next-auth/providers/twitch";
import type { NextAuthOptions } from "next-auth";

const TikTokProvider = (options: {
  clientId: string;
  clientSecret: string;
}) => ({
  id: "tiktok",
  name: "TikTok",
  type: "oauth" as const,
  authorization: "https://www.tiktok.com/v2/auth/authorize/",
  token: "https://open.tiktokapis.com/v2/oauth/token/",
  userinfo: "https://open.tiktokapis.com/v2/user/info/",
  clientId: options.clientId,
  clientSecret: options.clientSecret,
  profile(profile: any) {
    return {
      id: profile.data?.user?.open_id,
      name: profile.data?.user?.display_name,
      image: profile.data?.user?.avatar_url,
      email: null,
    };
  },
});

const InstagramProvider = (options: {
  clientId: string;
  clientSecret: string;
}) => ({
  id: "instagram",
  name: "Instagram",
  type: "oauth" as const,
  authorization:
    "https://api.instagram.com/oauth/authorize?scope=user_profile,user_media",
  token: "https://api.instagram.com/oauth/access_token",
  userinfo: "https://graph.instagram.com/me?fields=id,username,account_type",
  clientId: options.clientId,
  clientSecret: options.clientSecret,
  profile(profile: any) {
    return {
      id: profile.id,
      name: profile.username,
      email: null,
      image: null,
    };
  },
});

export const authOptions: NextAuthOptions = {
  providers: [
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
    TwitchProvider({
      clientId: process.env.TWITCH_CLIENT_ID!,
      clientSecret: process.env.TWITCH_CLIENT_SECRET!,
    }),
    TikTokProvider({
      clientId: process.env.TIKTOK_CLIENT_ID!,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET!,
    }),
    InstagramProvider({
      clientId: process.env.INSTAGRAM_CLIENT_ID!,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
    }),
  ],
};
