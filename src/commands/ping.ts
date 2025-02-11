import * as Djs from "discord.js";
import { cmdLn, ln } from "../locales";
import i18next from "../locales/init";
import { createFile, downloadJSONTemplate } from "../tickets/template";

const t = i18next.getFixedT("en");
export const pingRole = {
	data: new Djs.SlashCommandBuilder()
		.setName(t("ping.title"))
		.setDescription(t("ping.description"))
		.setDescriptionLocalizations(cmdLn("ping.description"))
		.setNameLocalizations(cmdLn("ping.title"))
		.addStringOption((option) =>
			option
				.setName(t("messageId.title"))
				.setDescription(t("messageId.description"))
				.setDescriptionLocalizations(cmdLn("messageId.description"))
				.setNameLocalizations(cmdLn("messageId.title"))
				.setRequired(true)
		)
		.addBooleanOption((option) =>
			option
				.setName(t("common.toggle"))
				.setDescription(t("ping.toggle"))
				.setDescriptionLocalizations(cmdLn("ping.toggle"))
				.setNameLocalizations(cmdLn("common.toggle"))
		),
	execute: async (interaction: Djs.CommandInteraction) => {
		if (!interaction.guildId) return;
		const options = interaction.options as Djs.CommandInteractionOptionResolver;
		const messageId = options.getString("message_id", true);
		const toggle = options.getBoolean("toggle", false);
		const template = await downloadJSONTemplate(messageId, interaction);
		if (!template) return;
		const ul = ln(interaction.locale);
		const { ticket, message } = template;
		ticket.ping = toggle || false;
		await message.edit({ files: [] });
		await message.edit({ files: createFile(ticket) });
		const success = toggle ? ul("ping.success.true") : ul("ping.success.false");
		await interaction.reply({
			content: success,
			flags: Djs.MessageFlags.Ephemeral,
		});
	},
};
