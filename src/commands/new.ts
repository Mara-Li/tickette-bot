import {
	ChannelType,
	type CommandInteraction,
	type CommandInteractionOptionResolver,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";

import type { TemplateModals, Ticket } from "../interface";
import { cmdLn, ln } from "../locales";
import i18next from "../locales/init";
import { createEmbed } from "../tickets/modals";
import { createJSONTemplate } from "../tickets/template";

const t = i18next.getFixedT("en");

export const create = {
	data: new SlashCommandBuilder()
		.setName(t("new.name"))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.setDescription(t("new.description"))
		.setNameLocalizations(cmdLn("new.name"))
		.setDescriptionLocalizations(cmdLn("new.description"))
		.addStringOption((option) =>
			option
				.setName(t("embed.title.title"))
				.setDescription(t("embed.title.description"))
				.setDescriptionLocalizations(cmdLn("embed.title.description"))
				.setNameLocalizations(cmdLn("embed.title.title"))
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName(t("new.thread_name.name"))
				.setDescription(t("new.thread_name.description"))
				.setNameLocalizations(cmdLn("new.thread_name.name"))
				.setDescriptionLocalizations(cmdLn("new.thread_name.description"))
				.setRequired(true)
		)
		.addRoleOption((option) =>
			option
				.setName(t("common.role"))
				.setDescription(t("new.role.description"))
				.setNameLocalizations(cmdLn("common.role"))
				.setDescriptionLocalizations(cmdLn("new.role.description"))
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName(t("embed.content.title"))
				.setDescription(t("new.embed_content.description"))
				.setNameLocalizations(cmdLn("embed.content.title"))
				.setDescriptionLocalizations(cmdLn("new.embed_content.description"))
				.setRequired(true)
		)
		.addChannelOption((option) =>
			option
				.setName(t("common.channel"))
				.setDescription(t("new.channel.description"))
				.setNameLocalizations(cmdLn("common.channel"))
				.setDescriptionLocalizations(cmdLn("new.channel.description"))
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText)
		),
	async execute(interaction: CommandInteraction) {
		const options = interaction.options as CommandInteractionOptionResolver;
		const name = options.getString(t("embed.title.title"), true);
		const role = [options.getRole("role", true).id];
		const channel = options.getChannel("channel", true).id;
		const threadName = options.getString("thread_name", true);
		const fields = [];
		const ul = ln(interaction.locale);
		for (let i = 1; i < 5; i++) {
			const fieldName = options.getString(`field_${i}_name`);
			const fieldDescription = options.getString(`field_${i}_description`) ?? "";
			const fieldType = options.getString(`field_${i}_type`) ?? "short";
			const fieldId =
				options.getString(`field_${i}_id`) ?? `${ul("common.field")}-${i}`;
			const fieldRequired = options.getBoolean(`field_${i}_required`) ?? false;
			if (fieldName) {
				const templateMod: TemplateModals = {
					name: fieldName,
					description: fieldDescription,
					type: fieldType as "short" | "paragraph",
					required: fieldRequired,
					id: fieldId,
				};
				fields.push(templateMod);
			}
		}
		const template: Ticket = {
			fields,
			roles: role,
			name,
			channel,
			description: options.getString(t("new.embed_content.name"), true),
			threadName,
			ping: false,
		};
		await createJSONTemplate(template, interaction);
		const fetchedReply = await interaction.fetchReply();
		//pins the message
		await fetchedReply.pin();
		await createEmbed(interaction, template, fetchedReply.id, interaction.channelId);
		return;
	},
};

for (let i = 1; i <= 4; i++) {
	create.data
		.addStringOption((option) =>
			option
				.setName(`field_${i}_id`)
				.setDescription(t("field.id"))
				.setDescriptionLocalizations(cmdLn("field.id"))
				.setRequired(false)
		)
		.addStringOption((option) =>
			option
				.setName(`field_${i}_name`)
				.setDescription(t("field.name"))
				.setDescriptionLocalizations(cmdLn("field.name"))
				.setMaxLength(45)
				.setRequired(false)
		)
		.addStringOption((option) =>
			option
				.setName(`field_${i}_description`)
				.setDescription(t("field.description"))
				.setDescriptionLocalizations(cmdLn("field.description"))
				.setRequired(false)
		)
		.addStringOption((option) =>
			option
				.setName(`field_${i}_type`)
				.setDescription(t("field.type"))
				.setDescriptionLocalizations(cmdLn("field.type"))
				.setRequired(false)
				.addChoices(
					// biome-ignore lint/style/useNamingConvention: <explanation>
					{ name: "short", value: "short", name_localizations: cmdLn("field.short") },
					{
						name: "paragraph",
						value: "paragraph",
						// biome-ignore lint/style/useNamingConvention: <explanation>
						name_localizations: cmdLn("field.paragraph"),
					}
				)
		)
		.addBooleanOption((option) =>
			option
				.setName(`field_${i}_required`)
				.setDescription(t("field.required"))
				.setDescriptionLocalizations(cmdLn("field.required"))
				.setRequired(false)
		);
}
