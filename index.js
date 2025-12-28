require("dotenv").config();
const { Client, GatewayIntentBits, SlashCommandBuilder } = require("discord.js");
const axios = require("axios");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const command = new SlashCommandBuilder()
  .setName("updatestat")
  .setDescription("Update Ymir Member Stats")
  .addStringOption(o => o.setName("ign").setDescription("In game name (case-sensitive)").setRequired(true))
  .addIntegerOption(o => o.setName("gr").setDescription("Gear Rating").setRequired(true))
  .addIntegerOption(o => o.setName("level").setDescription("Level").setRequired(true))
  .addIntegerOption(o => o.setName("gd").setDescription("Guild Donation").setRequired(true))
  .addStringOption(o =>
    o.setName("class")
      .setDescription("Class")
      .setRequired(true)
      .addChoices(
        { name: "Warlord", value: "Warlord" },
        { name: "Berserker", value: "Berserker" },
        { name: "Skald", value: "Skald" },
        { name: "Archer", value: "Archer" }
      )
  );

client.once("ready", async () => {
  const guild = await client.guilds.fetch("1227614196456488991");
  await guild.commands.create(command);
  console.log("Ymir Bot Ready");
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "updatestat") return;

  await interaction.deferReply({ ephemeral: true });

  try {
    const payload = {
      ign: interaction.options.getString("ign"), // EXACT CASE
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
      return interaction.editReply("❌ This user does not exist. Please check the IGN spelling and case.");
    }

    if (result.status === "updated") {
      return interaction.editReply("✅ Thank you for updating your details.");
    }

    await interaction.editReply("❌ Failed to update Google Sheet.");
  } catch (err) {
    console.error(err);
    await interaction.editReply("❌ Failed to update Google Sheet.");
  }
});

client.login(process.env.TOKEN);
