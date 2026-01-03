require("dotenv").config();
const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

/* ---------- SLASH COMMAND ---------- */
const command = new SlashCommandBuilder()
  .setName("updatestat")
  .setDescription("Update Ymir Member Stats")
  .addStringOption(o =>
    o.setName("ign")
      .setDescription("In game name (CASE-SENSITIVE)")
      .setRequired(true)
  )
  .addIntegerOption(o =>
    o.setName("gr")
      .setDescription("Gear Rating")
      .setRequired(true)
  )
  .addIntegerOption(o =>
    o.setName("level")
      .setDescription("Level")
      .setRequired(true)
  )
  .addIntegerOption(o =>
    o.setName("gd")
      .setDescription("Guild Donation")
      .setRequired(true)
  )
  .addStringOption(o =>
    o.setName("class")
      .setDescription("Class")
      .setRequired(true)
      .addChoices(
        { name: "Warlord", value: "Warlord" },
        { name: "Berserker", value: "Berserker" },
        { name: "Skald", value: "Skald" },
        { name: "Archer", value: "Archer" },
        { name: "Volva", value: "Volva" }
      )
  );

/* ---------- BOT READY ---------- */
client.once("ready", async () => {

  // ⚠️ TEMPORARY: CLEAR OLD COMMAND CACHE
  await client.application.commands.set([]);
  console.log("🧹 Cleared old slash commands");

  // REGISTER NEW COMMAND WITH VOLVA
  await client.application.commands.create(command);
  console.log("🔥 AYASAVEmir Bot reloaded with Volva class");
});

/* ---------- COMMAND HANDLER ---------- */
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "updatestat") return;

  await interaction.deferReply({ ephemeral: true });

  try {
    const payload = {
      ign: interaction.options.getString("ign"),
      gr: interaction.options.getInteger("gr"),
      level: interaction.options.getInteger("level"),
      gd: interaction.options.getInteger("gd"),
      class: interaction.options.getString("class")
    };

    const res = await axios.post(process.env.SHEET_URL, payload, {
      headers: { "Content-Type": "application/json" }
    });

    const result = typeof res.data === "string" ? JSON.parse(res.data) : res.data;

    if (result.status === "not_found") {
      return interaction.editReply("❌ IGN not found. Please check spelling and case.");
    }

    if (result.status === "updated") {

      const time = new Date().toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });

      const embed = new EmbedBuilder()
        .setColor("#00ff9c")
        .setTitle("📈 Ymir Progress Update")
        .addFields(
          { name: "Player", value: payload.ign, inline: true },
          { name: "Class", value: payload.class, inline: true },
          { name: "GR", value: payload.gr.toString(), inline: true },
          { name: "Level", value: payload.level.toString(), inline: true },
          { name: "Guild Donation", value: payload.gd.toString(), inline: true },
          { name: "Time", value: time, inline: true }
        )
        .setFooter({ text: `Updated by ${interaction.user.username}` });

      const logChannel = interaction.guild.channels.cache.find(ch => ch.name === "progress-logs");
      if (logChannel) await logChannel.send({ embeds: [embed] });

      return interaction.editReply("✅ Your stats have been updated successfully!");
    }

    await interaction.editReply("❌ Failed to update Google Sheet.");
  } catch (err) {
    console.error(err);
    await interaction.editReply("❌ System error. Please contact your GL / DGM.");
  }
});

client.login(process.env.TOKEN);
