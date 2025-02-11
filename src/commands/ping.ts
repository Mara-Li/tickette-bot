import * as Djs from "discord.js";
import { ln } from "../locales";
import en from "../locales/language/en.json";
import fr from "../locales/language/fr.json";
import { createFile, downloadJSONTemplate } from "../tickets/template";

export const pingRole = {
	data: new Djs.SlashCommandBuilder()
		.setName(en.ping.title)
		.setDescription(en.ping.description)
		.setDescriptionLocalizations({
			fr: fr.ping.description,
		})
		.setNameLocalizations({
			fr: fr.ping.title,
		})
		.addStringOption((option) =>
			option
				.setName(en.message_id.name)
				.setDescription(en.message_id.description)
				.setDescriptionLocalizations({
					fr: fr.message_id.description,
				})
				.setNameLocalizations({
					fr: fr.message_id.name,
				})
				.setRequired(true)
		)
		.addBooleanOption((option) =>
			option
				.setName(en.common.toggle)
				.setDescription(en.ping.toggle)
				.setDescriptionLocalizations({
					fr: fr.ping.toggle,
				})
				.setNameLocalizations({
					fr: fr.common.toggle,
				})
		),
	execute: async (interaction: Djs.CommandInteraction) => {
		if (!interaction.guildId) return;
		const options = interaction.options as Djs.CommandInteractionOptionResolver;
		const messageId = options.getString("message_id", true);
		const toggle = options.getBoolean("toggle", false);
		const template = await downloadJSONTemplate(messageId, interaction);
		if (!template) return;
		const { ticket, message } = template;
		ticket.ping = toggle || false;
		await message.edit({ files: [] });
		await message.edit({ files: createFile(ticket) });
		const success = toggle
			? ln(interaction).ping.success.true
			: ln(interaction).ping.success.false;
		await interaction.reply({
			content: success,
			flags: Djs.MessageFlags.Ephemeral,
		});
	},
};
