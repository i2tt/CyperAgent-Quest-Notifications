require('dotenv').config();

const config = {
  botToken: process.env.DISCORD_BOT_TOKEN,

  selfToken: process.env.DISCORD_SELF_TOKEN,

  guildId: process.env.DISCORD_GUILD_ID,
  channelId: process.env.DISCORD_CHANNEL_ID,

  checkInterval: parseInt(process.env.CHECK_INTERVAL ?? '60', 10),

  discordApiBase: 'https://discord.com/api/v9',

  endpoints: {
    currentQuests: '/quests/@me',
    claimedQuests: '/quests/@me/claimed',
    questDetail: (id) => `/quests/${id}`,
    questPreview: (id) => `/quests/${id}/preview`,
  },

  placeholders: {
    banner: 'https://i.imgur.com/8gMGvMa.png',
    thumbnail: 'https://i.imgur.com/6TGxGqU.png',
    reward: 'https://i.imgur.com/AfFp7pu.png',
  },
};

const required = ['botToken', 'selfToken', 'channelId'];
for (const key of required) {
  if (!config[key]) {
    console.error(`[Config] Missing required env var for "${key}". Check your .env file.`);
    process.exit(1);
  }
}

module.exports = config;
