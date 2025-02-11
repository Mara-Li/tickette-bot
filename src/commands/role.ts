import {
	type CommandInteraction,
	type CommandInteractionOptionResolver,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";

import { cmdLn, ln } from "../locales";
import i18next from "../locales/init";

import { addRoleToTemplate, removeRoleToTemplate } from "../tickets/editRole";
import { downloadJSONTemplate } from "../tickets/template";

const t = i18next.getFixedT("en");

export const role = {
	data: new SlashCommandBuilder()
		.setName(t("common.role"))
		.setDescription(t("role.description"))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.setNameLocalizations(cmdLn("common.role"))
		.setDescriptionLocalizations(cmdLn("role.description"))
		.addStringOption((option) =>
			option
				.setName(t("messageId.title"))
				.setDescription(t("messageId.description"))
				.setNameLocalizations(cmdLn("messageId.title"))
				.setDescriptionLocalizations(cmdLn("messageId.description"))
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName(t("role.choice.name"))
				.setDescription(t("role.choice.description"))
				.setNameLocalizations(cmdLn("role.choice.name"))
				.setDescriptionLocalizations(cmdLn("role.choice.description"))
				.setRequired(true)
				.addChoices(
					{
						name: t("role.choice.add"),
						value: "add",
						// biome-ignore lint/style/useNamingConvention: <explanation>
						name_localizations: cmdLn("role.choice.add"),
					},
					{
						name: t("role.choice.remove"),
						value: "remove",
						// biome-ignore lint/style/useNamingConvention: <explanation>
						name_localizations: cmdLn("role.choice.remove"),
					}
				)
		)
		.addRoleOption((option) =>
			option
				.setName(t("common.role"))
				.setDescription(t("role.role.description"))
				.setNameLocalizations(cmdLn("common.role"))
				.setDescriptionLocalizations(cmdLn("role.role.description"))
				.setRequired(true)
		),
	async execute(interaction: CommandInteraction) {
		const options = interaction.options as CommandInteractionOptionResolver;
		const messageId = options.getString("message_id", true);
		const choice = options.getString("choice", true) as "add" | "remove";
		//download the previous template
		const template = await downloadJSONTemplate(messageId, interaction);
		if (!template) return;
		const lang = ln(interaction.locale);
		const { ticket, message } = template;
		const role = options.getRole("role", true).id;
		switch (choice) {
			case "add":
				await addRoleToTemplate(role, ticket, message);
				await interaction.reply({
					content: lang("edit.role.add", { role: `<@&${role}>` }),
				});
				break;
			case "remove":
				if (ticket.roles.length === 1) {
					await interaction.reply({
						content: lang("error.role.left"),
					});
					return;
				}
				if (!ticket.roles.includes(role)) {
					await interaction.reply({
						content: lang("error.role.notInTemplate", { role: `<@&${role}>` }),
					});
					return;
				}
				await removeRoleToTemplate(role, ticket, message);
				await interaction.reply({
					content: lang("edit.role.remove", { role: `<@&${role}>` }),
				});
				break;
		}
		return;
	},
};
