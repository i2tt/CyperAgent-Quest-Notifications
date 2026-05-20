'use strict';

process.on('uncaughtException', (err) => {
  console.error('❌ [Fatal] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('❌ [Fatal] Unhandled Rejection:', reason);
});

const {
  Client,
  GatewayIntentBits,
  Events,
  REST,
  Routes,
  SlashCommandBuilder,
  MessageFlags,
} = require('discord.js');

const config        = require('./config');
const logger        = require('./src/logger');
const poller        = require('./src/questPoller');
const cmdHandlers   = require('./src/commands');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
  ],
});

const commands = [
  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check the health and stats of EnzoQuests'),
  new SlashCommandBuilder()
    .setName('last_quests')
    .setDescription('Show the most recent quests found'),
  new SlashCommandBuilder()
    .setName('check_now')
    .setDescription('Force a manual quest check (Admin only)'),
  new SlashCommandBuilder()
    .setName('test_quest')
    .setDescription('Send a test notification for a specific quest ID')
    .addStringOption(opt => 
      opt.setName('quest_id')
         .setDescription('The ID of the quest to test (optional)')
         .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName('token')
    .setDescription('Manage self-tokens for polling')
    .addSubcommand(sub =>
      sub.setName('add')
         .setDescription('Add a new self-token')
         .addStringOption(o => o.setName('token').setDescription('Discord Self-Token').setRequired(true))
         .addStringOption(o => o.setName('label').setDescription('Account label (e.g. Main)').setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('list')
         .setDescription('List all registered tokens')
    )
    .addSubcommand(sub =>
      sub.setName('remove')
         .setDescription('Remove a self-token')
         .addStringOption(o => o.setName('token').setDescription('The token to remove').setRequired(true))
    ),
  new SlashCommandBuilder()
    .setName('webhook')
    .setDescription('Manage notification webhooks')
    .addSubcommand(sub =>
      sub.setName('add')
         .setDescription('Add a new webhook destination')
         .addStringOption(o => o.setName('url').setDescription('Discord Webhook URL').setRequired(true))
         .addStringOption(o => o.setName('name').setDescription('A friendly name for this webhook').setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('list')
         .setDescription('List all registered webhooks')
    )
    .addSubcommand(sub =>
      sub.setName('remove')
         .setDescription('Remove a webhook destination')
         .addStringOption(o => o.setName('url').setDescription('The URL of the webhook to remove').setRequired(true))
    ),
  new SlashCommandBuilder()
    .setName('settings')
    .setDescription('Configure bot settings')
    .addSubcommand(sub =>
      sub.setName('ping')
         .setDescription('Set the ping target (e.g. @everyone or a role ID)')
         .addStringOption(o => o.setName('target').setDescription('The ping target (e.g. @everyone, <@&ROLE_ID>)').setRequired(true))
    ),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(config.botToken);

async function registerCommands() {
  try {
    logger.info('Bot', 'Started refreshing application (/) commands.');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );
    logger.info('Bot', 'Successfully reloaded application (/) commands.');
  } catch (error) {
    logger.error('Bot', `Failed to register commands: ${error.message}`);
  }
}

client.once(Events.ClientReady, async (readyClient) => {
  logger.info('Bot', `✅ Logged in as ${readyClient.user.tag}`);
  await registerCommands();
  poller.startPoller(client);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options } = interaction;

  const isAdmin = interaction.member?.permissions.has('Administrator');

  if (commandName === 'status') {
    await cmdHandlers.handleStatus(interaction);
  } else if (commandName === 'last_quests') {
    await cmdHandlers.handleLastQuests(interaction);
  } else if (commandName === 'check_now') {
    if (!isAdmin) return interaction.reply({ content: '❌ Admin only.', flags: [MessageFlags.Ephemeral] });
    await cmdHandlers.handleCheckNow(interaction);
  } else if (commandName === 'test_quest') {
    if (!isAdmin) return interaction.reply({ content: '❌ Admin only.', flags: [MessageFlags.Ephemeral] });
    await cmdHandlers.handleTestQuest(interaction);
  } else if (commandName === 'token') {
    if (!isAdmin) return interaction.reply({ content: '❌ Admin only.', flags: [MessageFlags.Ephemeral] });
    const sub = options.getSubcommand();
    if (sub === 'add') await cmdHandlers.handleTokenAdd(interaction);
    else if (sub === 'list') await cmdHandlers.handleTokenList(interaction);
    else if (sub === 'remove') await cmdHandlers.handleTokenRemove(interaction);
  } else if (commandName === 'webhook') {
    if (!isAdmin) return interaction.reply({ content: '❌ Admin only.', flags: [MessageFlags.Ephemeral] });
    const sub = options.getSubcommand();
    if (sub === 'add') await cmdHandlers.handleWebhookAdd(interaction);
    else if (sub === 'list') await cmdHandlers.handleWebhookList(interaction);
    else if (sub === 'remove') await cmdHandlers.handleWebhookRemove(interaction);
  } else if (commandName === 'settings') {
    if (!isAdmin) return interaction.reply({ content: '❌ Admin only.', flags: [MessageFlags.Ephemeral] });
    const sub = options.getSubcommand();
    if (sub === 'ping') await cmdHandlers.handleSettingsPing(interaction);
  }
});

client.on('newQuestDetected', (quest) => {
  logger.signal('Bot', `📡 Signal received: New quest → "${quest.name}" (ID: ${quest.id})`);
});

client.on(Events.Error, (err) => {
  logger.error('Bot', `Discord client error: ${err.message}`);
});

client.login(config.botToken).catch((err) => {
  logger.error('Bot', `Failed to login: ${err.message}`);
  process.exit(1);
});

function shutdown(signal) {
  logger.warn('Bot', `Received ${signal} — shutting down gracefully...`);
  client.destroy();
  process.exit(0);
}

process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
