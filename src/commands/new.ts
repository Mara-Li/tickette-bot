import { ChannelType, CommandInteraction, CommandInteractionOptionResolver, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { TemplateModals, Ticket } from "../interface";
import { ln } from "../locales/index";
import en from "../locales/language/en";
import fr from "../locales/language/fr";
import { createEmbed } from "../tickets/modals";
import { createJSONTemplate } from "../tickets/template";


export const create = {
	data: new SlashCommandBuilder()
		.setName(en.new.name)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.setDescription(en.new.description)
		.setNameLocalizations({
			fr: fr.new.name
		})
		.setDescriptionLocalizations({
			fr: fr.new.description
		})
		.addStringOption(option =>
			option
				.setName(en.new.embed.name)
				.setDescription(en.new.embed.description)
				.setDescriptionLocalizations({
					fr: fr.new.embed.description
				})
				.setNameLocalizations({
					fr: fr.new.embed.name
				})
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName(en.new.thread_name.name)
				.setDescription(en.new.thread_name.description)
				.setNameLocalizations({
					fr: fr.new.thread_name.name
				})
				.setDescriptionLocalizations({
					fr: fr.new.thread_name.description
				})
				.setRequired(true)
		)
		.addRoleOption(option =>
			option
				.setName(en.common.role)
				.setDescription(en.new.role.description)
				.setNameLocalizations({
					fr: fr.common.role
				})
				.setDescriptionLocalizations({
					fr: fr.new.role.description
				})
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName(en.new.embed_content.name)
				.setDescription(en.new.embed_content.description)
				.setNameLocalizations({
					fr: fr.new.embed_content.name
				})
				.setDescriptionLocalizations({
					fr: fr.new.embed_content.description
				})
				.setRequired(true))
		.addChannelOption(option =>
			option
				.setName(en.new.channel.name)
				.setDescription(en.new.channel.description)
				.setNameLocalizations({
					fr: fr.new.channel.name
				})
				.setDescriptionLocalizations({
					fr: fr.new.channel.description
				})
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText)
		),
	async execute(interaction: CommandInteraction) {
		const options = interaction.options as CommandInteractionOptionResolver;
		const name = options.getString("name", true);
		const role = [options.getRole("role", true).id];
		const channel = options.getChannel("channel", true).id;
		const threadName = options.getString("thread_name", true);
		const fields = [];
		for (let i = 1; i < 5; i++) {
			const field_name = options.getString(`field_${i}_name`);
			const field_description = options.getString(`field_${i}_description`) ?? "";
			const field_type = options.getString(`field_${i}_type`) ?? "short";
			const field_id = options.getString(`field_${i}_id`) ?? `${ln(interaction).common.field}-${i}`;
			const field_required = options.getBoolean(`field_${i}_required`) ?? false;
			if (field_name) {
				const templateMod: TemplateModals = {
					name: field_name,
					description: field_description,
					type: field_type as "short" | "paragraph",
					required: field_required,
					id: field_id
				};
				fields.push(templateMod);
			}
		}
		const template: Ticket = {
			fields,
			roles: role,
			name,
			channel,
			description: options.getString("description", true),
			threadName
		};
		await createJSONTemplate(template, interaction.guildId!, interaction.channelId, interaction);
		const fetchedReply = await interaction.fetchReply();
		//pins the message
		await fetchedReply.pin();
		await createEmbed(interaction, template, fetchedReply.id, interaction.channelId);
		return;

	},
};

for (let i = 1; i <= 4; i++) {
	create.data
		.addStringOption(option =>
			option
				.setName(`field_${i}_id`)
				.setDescription(en.field.id)
				.setDescriptionLocalizations({
					fr: fr.field.id
				})
				.setRequired(false))
		.addStringOption(option =>
			option
				.setName(`field_${i}_name`)
				.setDescription(en.field.name)
				.setDescriptionLocalizations({
					fr: fr.field.name
				})
				.setMaxLength(45)
				.setRequired(false))
		.addStringOption(option =>
			option
				.setName(`field_${i}_description`)
				.setDescription(en.field.description)
				.setDescriptionLocalizations({
					fr: fr.field.description
				})
				.setRequired(false))
		.addStringOption(option =>
			option
				.setName(`field_${i}_type`)
				.setDescription(en.field.type)
				.setDescriptionLocalizations({
					fr: fr.field.type
				})
				.setRequired(false)
				.addChoices(
					{ name: "short", value: "short", name_localizations: { fr: fr.field.short } },
					{ name: "paragraph", value: "paragraph", name_localizations: { fr: fr.field.paragraph } }
				))
		.addBooleanOption(option =>
			option
				.setName(`field_${i}_required`)
				.setDescription("en.field.required")
				.setDescriptionLocalizations({
					fr: fr.field.required
				})
				.setRequired(false)
		);
}