require('dotenv').config();
const { Client, IntentsBitField, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  startCountdownTask();
});

function startCountdownTask() {
  // Run every minute
  cron.schedule('* * * * *', () => {
    updateCountdown();
  });
}

function updateCountdown() {
  const now = new Date();
  const endTime = new Date();
  
  // Set the end time to today at 8 PM
  endTime.setHours(20, 0, 0, 0);
  
  // If current time is past 8 PM, set end time to tomorrow
  if (now > endTime) {
    endTime.setDate(endTime.getDate() + 1);
  }
  
  // Calculate time remaining
  const timeRemaining = endTime - now;
  
  // Convert to hours and minutes
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  
  // Format the countdown
  let countdownText;
  if (timeRemaining <= 0) {
    countdownText = "Group Therapy Ended";
  } else {
    countdownText = `Group Therapy: ${hoursRemaining}h ${minutesRemaining}m left`;
  }
  
  // Update the channel name
  const channelId = process.env.CHANNEL_ID;
  const channel = client.channels.cache.get(channelId);
  
  if (channel && channel.manageable) {
    channel.setName(countdownText)
      .then(() => console.log(`Updated channel name to: ${countdownText}`))
      .catch(error => console.error(`Error updating channel name: ${error}`));
  } else {
    console.error('Cannot access or update the channel');
  }
}

client.login(process.env.DISCORD_TOKEN);