import {
	type CommandInteraction,
	type CommandInteractionOptionResolver,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";

import { cmdLn, ln } from "../locales";
import i18next from "../locales/init";
import { renameThread } from "../tickets/editname";
import { downloadJSONTemplate } from "../tickets/template";

const t = i18next.getFixedT("en");
export const rename = {
	data: new SlashCommandBuilder()
		.setName(t("rename.title"))
		.setDescription(t("rename.description"))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.setNameLocalizations(cmdLn("rename.title"))
		.setDescriptionLocalizations(cmdLn("rename.description"))
		.addStringOption((option) =>
			option
				.setName(t("message_id.name"))
				.setDescription(t("message_id.description"))
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName(t("new.thread_name.name"))
				.setNameLocalizations(cmdLn("new.thread_name.name"))
				.setDescription(t("new.thread_name.description"))
				.setDescriptionLocalizations(cmdLn("new.thread_name.description"))
				.setRequired(true)
		),
	async execute(interaction: CommandInteraction) {
		const options = interaction.options as CommandInteractionOptionResolver;
		const messageId = options.getString("message_id", true);
		const threadName = options.getString("thread_name", true);
		const template = await downloadJSONTemplate(messageId, interaction);
		const lang = ln(interaction.locale);
		if (!template) {
			await interaction.reply({
				content: lang("error.channel"),
			});
			return;
		}
		const { ticket, message } = template;
		await renameThread(threadName, ticket, message);
	},
};
