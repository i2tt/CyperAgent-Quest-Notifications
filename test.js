// test.js — Force-send a notification for a specific quest ID
// Usage: node test.js <questId>
// Example: node test.js 1487114101732802560
'use strict';

const fs     = require('fs');
const { Client, GatewayIntentBits, Events } = require('discord.js');
const axios   = require('axios');
const config  = require('./config');
const logger  = require('./src/logger');
const { parseQuest }           = require('./src/questParser');
const { sendQuestNotification } = require('./src/questNotifier');

const questId = process.argv[2] ?? '1487114101732802560';

const discordApi = axios.create({
  baseURL: config.discordApiBase,
  headers: {
    'Authorization': config.selfToken,
    'User-Agent':    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Content-Type':  'application/json',
    'Accept':        'application/json',
    'X-Super-Properties': Buffer.from(JSON.stringify({
      os: 'Windows', browser: 'Chrome', device: '',
      system_locale: 'en-US', browser_version: '124.0.0.0',
      os_version: '10', release_channel: 'stable', client_build_number: 9999999,
    })).toString('base64'),
  },
  timeout: 15_000,
});

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async () => {
  logger.info('Test', `✅ Bot logged in as ${client.user.tag}`);
  logger.info('Test', `🔍 Fetching quest ID: ${questId}`);

  try {
    // Try the detail endpoint first
    let raw = null;
    try {
      const res = await discordApi.get(config.endpoints.questDetail(questId));
      raw = res.data;
      logger.info('Test', `✅ Got quest detail from /quests/${questId}`);
    } catch (e) {
      logger.warn('Test', `Detail endpoint failed (${e.response?.status ?? e.message}), trying /quests/@me...`);
    }

    // Fallback: search in active quests
    if (!raw) {
      const res = await discordApi.get(config.endpoints.currentQuests);
      const list = Array.isArray(res.data) ? res.data
                 : Array.isArray(res.data?.quests) ? res.data.quests
                 : [];
      raw = list.find(q =>
        String(q.id ?? q.quest_id ?? q.config?.quest_id ?? '') === String(questId)
      ) ?? null;

      if (raw) {
        logger.info('Test', `✅ Found quest in /quests/@me list`);
      } else {
        logger.warn('Test', `Quest ${questId} not in active list — building mock from preview...`);
        // Try preview endpoint
        try {
          const prev = await discordApi.get(config.endpoints.questPreview(questId));
          raw = prev.data;
          logger.info('Test', `✅ Got quest preview`);
        } catch (pe) {
          logger.error('Test', `All endpoints failed. Cannot fetch quest ${questId}.`);
          logger.info('Test', `Raw error: ${pe.response?.status} ${pe.response?.statusText}`);
          client.destroy();
          return;
        }
      }
    }

    // (Optional) Uncomment to debug raw response
    // console.dir(raw, { depth: 6, colors: true });

    // Parse + send
    const quest = parseQuest(raw);
    logger.quest('Test', `📨 Sending notification for: "${quest.name}"`);
    await sendQuestNotification(client, quest);
    logger.quest('Test', `✅ Done!`);

  } catch (err) {
    logger.error('Test', err);
  } finally {
    setTimeout(() => { client.destroy(); process.exit(0); }, 2000);
  }
});

client.login(config.botToken).catch(err => {
  logger.error('Test', `Login failed: ${err.message}`);
  process.exit(1);
});
