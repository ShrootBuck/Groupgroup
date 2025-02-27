# Group Therapy Timer Bot

A simple Discord bot that updates a channel name with a countdown to 8 PM when "Group Therapy" ends each day.

## Setup

1. Create a Discord bot on the [Discord Developer Portal](https://discord.com/developers/applications)
2. Get your bot token and invite the bot to your server with channel management permissions
3. Install dependencies:
   ```
   npm install
   ```
4. Edit the `.env` file with your bot token and channel ID:
   ```
   DISCORD_TOKEN=your_discord_bot_token_here
   CHANNEL_ID=your_discord_channel_id_here
   ```
5. Start the bot:
   ```
   node index.js
   ```

## Features

- Updates channel name every minute with countdown to 8 PM
- Shows hours and minutes remaining
- Resets automatically for the next day after 8 PM