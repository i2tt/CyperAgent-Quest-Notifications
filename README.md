

<h1 align="center">CyperAgent Quests Bot</h1>


<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v16.11+-green?style=for-the-badge&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/SQLite-3.x-blue?style=for-the-badge&logo=sqlite" alt="SQLite">
  <img src="https://img.shields.io/badge/Discord.js-v14-5865F2?style=for-the-badge&logo=discord" alt="Discord.js">
  <img src="https://img.shields.io/badge/Language-Arabic/English-orange?style=for-the-badge" alt="Language">
</p>

---

##  Features Highlight

| Feature | Description |
| :--- | :--- |
|  **Multi-Token** | Monitor quests across dozens of accounts simultaneously |
|  **Anti-Ban Jitter** | Human-like randomized polling to protect your accounts |
|  **SQLite DB** | High-performance persistent storage for quests and settings |
|  **Localization** | Native Arabic and English support with hyphenated aesthetics |
|  **Webhooks** | Broadcast new quests to multiple Discord servers instantly |
|  **Custom Pings** | Personalized mention targets (@everyone, roles, etc.) |

---

##  Quick Start

### 📋 Prerequisites
- **Node.js**: v16.11.0+
- **Account Tokens**: Your bot token and self-tokens.

### 📥 Installation
```bash
# Clone the repository
git clone https://github.com/EnzoNotNice/EnzoQuests.git

# Enter the directory
cd CyperQuests

# Install dependencies
npm install
```

###  Configuration
Create a `.env` file and fill in your credentials:
```env
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_SELF_TOKEN=your_primary_self_token
DISCORD_CHANNEL_ID=logging_channel_id
CHECK_INTERVAL=60
```

---

##  Command Center

| Command | Subcommands | Description |
| :--- | :--- | :--- |
| `/status` | — | Check health, uptime, and account status |
| `/last_quests` | — | View recently discovered active quests |
| `/check_now` | — | Trigger an instant manual quest search |
| `/token` | `add`, `list`, `remove` | Manage your self-token collection |
| `/webhook` | `add`, `list`, `remove` | Manage notification destinations |
| `/settings` | `ping` | Configure the mention target |

---

##  Security & Safety

> [!CAUTION]
> **LEGAL NOTICE**: Automated user accounts (self-bots) violate Discord's Terms of Service. Using this software carries a risk of account suspension. Use at your own discretion.

**Our Protections:**
- **Randomized Polling**: We never poll at exact intervals.
- **Fail-Safe Alerts**: Instant notifications if any token becomes invalid.
- **Isolated Instances**: Each account is polled independently to prevent global rate limiting.

---

##  Contribution & License

Feel free to fork and pull request! This project is licensed under the **MIT License**.

<p align="center">
  Made By <strong>CyperAgent</strong>
</p>
