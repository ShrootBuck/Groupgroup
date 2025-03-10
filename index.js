require("dotenv").config();
import { Client, IntentsBitField, GatewayIntentBits } from "discord.js";
import { schedule } from "node-cron";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  startCountdownTask();
});

function startCountdownTask() {
  // Run every 5 minutes to avoid rate limits
  schedule("*/5 * * * *", () => {
    updateCountdown();
  });

  // Initial update when the bot starts
  updateCountdown();
}

function updateCountdown() {
  // Get the current time in Phoenix (MST/Arizona time - UTC-7 with no DST)
  const phoenixTime = new Date(
    Date.now() - 7 * 60 * 60 * 1000, // UTC-7 for Phoenix
  );

  // Check if today is a group day (Monday, Wednesday, or Thursday)
  const dayOfWeek = phoenixTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const isGroupDay = dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 4; // Monday, Wednesday, Thursday

  if (!isGroupDay) {
    // Not a group day, show "No group today!"
    countdownText = "no poop today";
  } else {
    // Set the start time to today at 4:00 PM Phoenix time (moved back one hour)
    const startTime = new Date(phoenixTime);
    startTime.setHours(16, 0, 0, 0);

    // Set the end time to today at 6:50 PM Phoenix time (moved back one hour)
    const endTime = new Date(phoenixTime);
    endTime.setHours(18, 50, 0, 0);

    // Set the post-group message cutoff time (30 minutes after end)
    const postGroupCutoff = new Date(endTime);
    postGroupCutoff.setMinutes(postGroupCutoff.getMinutes() + 30);

    // Adjust dates if needed
    if (phoenixTime < startTime) {
      // Before start time - show "Group in X time"
      const timeUntilStart = startTime - phoenixTime;
      const hoursUntilStart = Math.floor(timeUntilStart / (1000 * 60 * 60));
      const minutesUntilStart = Math.floor(
        (timeUntilStart % (1000 * 60 * 60)) / (1000 * 60),
      );
      countdownText = `Group in: ${hoursUntilStart}h ${minutesUntilStart}m`;
    } else if (phoenixTime >= startTime && phoenixTime <= endTime) {
      // During group - show time remaining
      const timeRemaining = endTime - phoenixTime;
      const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutesRemaining = Math.floor(
        (timeRemaining % (1000 * 60 * 60)) / (1000 * 60),
      );
      countdownText = `Group: ${hoursRemaining}h ${minutesRemaining}m left`;
    } else if (phoenixTime > endTime && phoenixTime <= postGroupCutoff) {
      // Within 30 minutes after end time
      countdownText = "poop over";
    } else {
      // After post-group cutoff - find next group day
      let daysToAdd = 1;
      while (daysToAdd <= 7) {
        const nextDay = new Date(phoenixTime);
        nextDay.setDate(phoenixTime.getDate() + daysToAdd);
        const nextDayOfWeek = nextDay.getDay();

        // Check if the next day is a group day
        if (nextDayOfWeek === 1 || nextDayOfWeek === 3 || nextDayOfWeek === 4) {
          // Found the next group day
          startTime.setDate(startTime.getDate() + daysToAdd);
          break;
        }
        daysToAdd++;
      }

      const timeUntilStart = startTime - phoenixTime;
      const hoursUntilStart = Math.floor(timeUntilStart / (1000 * 60 * 60));
      const minutesUntilStart = Math.floor(
        (timeUntilStart % (1000 * 60 * 60)) / (1000 * 60),
      );
      countdownText = `Group in: ${hoursUntilStart}h ${minutesUntilStart}m`;
    }

    // Special case for exactly at end time
    if (phoenixTime.getHours() === 18 && phoenixTime.getMinutes() === 50) {
      countdownText = "poop over";
    }
  }

  // Update the channel name
  const channelId = "1213697514042040411";
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
