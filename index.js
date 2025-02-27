require("dotenv").config();
const { Client, IntentsBitField, GatewayIntentBits } = require("discord.js");
const cron = require("node-cron");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  startCountdownTask();
});

function startCountdownTask() {
  // Run every 5 minutes to avoid rate limits
  cron.schedule("*/5 * * * *", () => {
    updateCountdown();
  });
}

function updateCountdown() {
  // Get the current time in Phoenix (MST/Arizona time - UTC-7 with no DST)
  const phoenixTime = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Phoenix" }),
  );
  const endTime = new Date(phoenixTime);

  // Set the end time to today at 7:50 PM Phoenix time
  endTime.setHours(19, 50, 0, 0);

  // If current Phoenix time is past 7:50 PM, set end time to tomorrow
  if (phoenixTime > endTime) {
    endTime.setDate(endTime.getDate() + 1);
  }

  // Calculate time remaining
  const timeRemaining = endTime - phoenixTime;

  // Convert to hours and minutes
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor(
    (timeRemaining % (1000 * 60 * 60)) / (1000 * 60),
  );

  // Format the countdown
  let countdownText;
  if (phoenixTime.getHours() === 19 && phoenixTime.getMinutes() === 50) {
    countdownText = "Group Ended";
  } else {
    countdownText = `Group: ${hoursRemaining}h ${minutesRemaining}m left`;
  }

  // Update the channel name
  const channelId = process.env.CHANNEL_ID;
  const channel = client.channels.cache.get(channelId);

  if (channel && channel.manageable) {
    channel
      .setName(countdownText)
      .then(() => console.log(`Updated channel name to: ${countdownText}`))
      .catch((error) => console.error(`Error updating channel name: ${error}`));
  } else {
    console.error("Cannot access or update the channel");
  }
}

client.login(process.env.DISCORD_TOKEN);
