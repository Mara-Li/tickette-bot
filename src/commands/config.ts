import {
	ChannelType,
	CommandInteraction,
	CommandInteractionOptionResolver,
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder,
} from "discord.js";

import { TemplateModals, Ticket } from "../interface";
import { ln } from "../locales";
import en from "../locales/language/en";
import fr from "../locales/language/fr";
import { renameThread } from "../tickets/editname";
import { addRoleToTemplate, removeRoleToTemplate } from "../tickets/editRole";
import { createEmbed } from "../tickets/embeds";
import { addFieldToTemplate, editFieldToTemplate, removeFieldToTemplate } from "../tickets/fields";
import { createJSONTemplate, downloadJSONTemplate } from "../tickets/template";
/**
 * Tickets commands :
 * /config new <template name for thread name> <@role> (optional field) // The template is saved as an json in the channel used for ticket creation ; template is pinned
 * /config role <ID_message_template> [choice: Add | remove | clean] <@role> // edit the role of the template
 * /config field <ID_message_template> [choice: Add | remove | edit] <field name> <field description> <field type> <required> // edit the field of the template
 * /create <ID_Message_Template> //create a ticket menu in the channel used for the command
 * /close
 */

const field = (data: SlashCommandSubcommandBuilder, nb: number) => {
	return data
		.addStringOption(option =>
			option
				.setName(`field_${nb}_name`)
				.setDescription(en.config.field.name)
				.setDescriptionLocalizations({
					fr: fr.config.field.name
				})
				.setRequired(false))
		.addStringOption(option =>
			option
				.setName(`field_${nb}_description`)
				.setDescription(en.config.field.description)
				.setDescriptionLocalizations({
					fr: fr.config.field.description
				})
				.setRequired(false))
		.addStringOption(option =>
			option
				.setName(`field_${nb}_type`)
				.setDescription(en.config.field.type)
				.setDescriptionLocalizations({
					fr: fr.config.field.type
				})
				.setRequired(false)
				.addChoices(
					{name: "short", value: "short", name_localizations: {fr: fr.config.field.short}},
					{name: "paragraph", value: "paragraph", name_localizations: {fr: fr.config.field.paragraph}}
				))
		.addBooleanOption(option =>
			option
				.setName(`field_${nb}_required`)
				.setDescription(en.config.field.required)
				.setDescriptionLocalizations({
					fr: fr.config.field.required
				})
				.setRequired(false)
		);
};


export const config = {
	data: new SlashCommandBuilder()
		.setName(en.config.title)
		.setDescription(en.config.description)
		.setNameLocalizations({
			fr: fr.config.title
		})
		.setDescriptionLocalizations({
			fr: fr.config.description
		})
		.addSubcommand((group => {
			let grp = group
				.setName(en.config.new.name)
				.setDescription(en.config.new.description)
				.setNameLocalizations({
					fr: fr.config.new.name
				})
				.setDescriptionLocalizations({
					fr: fr.config.new.description
				})
				.addStringOption(option =>
					option
						.setName(en.config.new.embed.name)
						.setDescription(en.config.new.embed.description)
						.setDescriptionLocalizations({
							fr: fr.config.new.embed.description
						})
						.setNameLocalizations({
							fr: fr.config.new.embed.name
						})
						.setRequired(true)
				)
				.addStringOption(option =>
					option
						.setName(en.config.new.thread_name.name)
						.setDescription(en.config.new.thread_name.description)
						.setNameLocalizations({
							fr: fr.config.new.thread_name.name
						})
						.setDescriptionLocalizations({
							fr: fr.config.new.thread_name.description
						})
						.setRequired(true)
				)
				.addRoleOption(option =>
					option
						.setName(en.common.role)
						.setDescription(en.config.new.role.description)
						.setNameLocalizations({
							fr: fr.common.role
						})
						.setDescriptionLocalizations({
							fr: fr.config.new.role.description
						})
						.setRequired(true)
				)
				.addStringOption(option =>
					option
						.setName(en.config.new.embed_content.name)
						.setDescription(en.config.new.embed_content.description)
						.setNameLocalizations({
							fr: fr.config.new.embed_content.name
						})
						.setDescriptionLocalizations({
							fr: fr.config.new.embed_content.description
						})
						.setRequired(true))
				.addChannelOption(option =>
					option
						.setName(en.config.new.channel.name)
						.setDescription(en.config.new.channel.description)
						.setNameLocalizations({
							fr: fr.config.new.channel.name
						})
						.setDescriptionLocalizations({
							fr: fr.config.new.channel.description
						})
						.setRequired(true)
						.addChannelTypes(ChannelType.GuildText)
				);
			//add the five duplicate field using field function
			for (let i = 1; i < 5; i++) {
				grp = field(grp, i);
			}
			return grp;
		})
		)
		.addSubcommand(group =>
			group
				.setName(en.common.role)
				.setDescription(en.config.role.description)
				.setNameLocalizations({
					fr: fr.common.role
				})
				.setDescriptionLocalizations({
					fr: fr.config.role.description
				})
				.addStringOption(option =>
					option
						.setName(en.config.edit.message_id.name)
						.setDescription(en.config.edit.message_id.description)
						.setNameLocalizations({
							fr: fr.config.edit.message_id.name
						})
						.setDescriptionLocalizations({
							fr: fr.config.edit.message_id.description
						})
						.setRequired(true)
				)
				.addStringOption(option =>
					option
						.setName(en.config.role.choice.name)
						.setDescription(en.config.role.choice.description)
						.setNameLocalizations({
							fr: fr.config.role.choice.name
						})
						.setDescriptionLocalizations({
							fr: fr.config.role.choice.description
						})
						.setRequired(true)
						.addChoices(
							{name: en.config.role.choice.add, value: "add", name_localizations: {fr: fr.config.role.choice.add}},
							{name: en.config.role.choice.remove, value: "remove", name_localizations: {fr: fr.config.role.choice.remove}},
						)
				)
				.addRoleOption(option =>
					option
						.setName(en.common.role)
						.setDescription(en.config.role.role.description)
						.setNameLocalizations({
							fr: fr.common.role
						})
						.setDescriptionLocalizations({
							fr: fr.config.role.role.description
						})
						.setRequired(true)
				)
		)
		.addSubcommand(group =>
			group
				.setName(en.config.rename.title)
				.setDescription(en.config.rename.description)
				.setNameLocalizations({
					fr: fr.config.rename.title
				})
				.setDescriptionLocalizations({
					fr: fr.config.rename.description
				})
				.addStringOption(option =>
					option
						.setName(en.config.edit.message_id.name)
						.setDescription(en.config.edit.message_id.description)
						.setRequired(true)
				)
				.addStringOption(option =>
					option
						.setName(en.config.new.thread_name.name)
						.setNameLocalizations({
							fr: fr.config.new.thread_name.name
						})
						.setDescription(en.config.new.thread_name.description)
						.setDescriptionLocalizations({
							fr: fr.config.new.thread_name.description
						})
						.setRequired(true)
				)

		)
		.addSubcommandGroup(group =>
			group
				.setName(en.config.fields.title)
				.setDescription(en.config.fields.description)
				.setNameLocalizations({
					fr: fr.config.fields.title
				})
				.setDescriptionLocalizations({
					fr: fr.config.fields.description
				})
				.addSubcommand(sub =>
					sub
						.setName(en.config.fields.remove.name)
						.setDescription(en.config.fields.remove.description)
						.addStringOption(option =>
							option
								.setName(en.config.edit.message_id.name)
								.setDescription(en.config.edit.message_id.description)
								.setDescriptionLocalizations({
									fr: fr.config.edit.message_id.description
								})
								.setNameLocalizations({
									fr: fr.config.edit.message_id.name
								})
								.setRequired(true)
						)
						.addStringOption(option =>
							option
								.setName(en.config.fields.name.name)
								.setNameLocalizations({
									fr: fr.config.fields.name.name
								})
								.setDescription(en.config.fields.name.description)
								.setDescriptionLocalizations({
									fr: fr.config.fields.name.description
								})
								.setRequired(true)
						)
				)
				.addSubcommand(sub =>
					sub
						.setName(en.config.fields.add.name)
						.setDescription(en.config.fields.add.description)
						.setDescriptionLocalizations({
							fr: fr.config.fields.add.description
						})
						.setNameLocalizations({
							fr: fr.config.fields.add.name
						})
						.addStringOption(option =>
							option
								.setName(en.config.edit.message_id.name)
								.setDescription(en.config.edit.message_id.description)
								.setDescriptionLocalizations({
									fr: fr.config.edit.message_id.description
								})
								.setNameLocalizations({
									fr: fr.config.edit.message_id.name
								})
								.setRequired(true)
						)
						.addStringOption(option =>
							option
								.setName(en.config.fields.name.name)
								.setNameLocalizations({
									fr: fr.config.fields.name.name
								})
								.setDescription(en.config.fields.name.description)
								.setDescriptionLocalizations({
									fr: fr.config.fields.name.description
								})
								.setRequired(true)
						)
						.addStringOption(option =>
							option
								.setName("field_description")
								.setDescription(en.config.field.description)
								.setDescriptionLocalizations({
									fr: fr.config.field.description
								})
								.setRequired(false)
						)
						.addStringOption(option =>
							option
								.setName("field_type")
								.setDescription(en.config.field.type)
								.setDescriptionLocalizations({
									fr: fr.config.field.type
								})
								.setRequired(false)
								.addChoices(
									{name: en.config.field.short, value: "short", name_localizations: {fr: fr.config.field.short}},
									{name: en.config.field.paragraph, value: "paragraph", name_localizations: {fr: fr.config.field.paragraph}}
								))
						.addBooleanOption(option =>
							option
								.setName("field_required")
								.setDescription(en.config.field.required)
								.setDescriptionLocalizations({
									fr: fr.config.field.required
								})
								.setRequired(false)
						)
				)
				.addSubcommand(sub =>
					sub
						.setName(en.config.fields.edit.name)
						.setDescription(en.config.fields.edit.description)
						.setDescriptionLocalizations({
							fr: fr.config.fields.edit.description
						})
						.addStringOption(option =>
							option
								.setName(en.config.edit.message_id.name)
								.setDescription(en.config.edit.message_id.description)
								.setDescriptionLocalizations({
									fr: fr.config.edit.message_id.description
								})
								.setNameLocalizations({
									fr: fr.config.edit.message_id.name
								})
								.setRequired(true)
						)
						.addStringOption(option =>
							option
								.setName(en.config.fields.name.name)
								.setNameLocalizations({
									fr: fr.config.fields.name.name
								})
								.setDescription(en.config.fields.name.description)
								.setDescriptionLocalizations({
									fr: fr.config.fields.name.description
								})
								.setRequired(true)
						)
						.addStringOption(option =>
							option
								.setName("field_description")
								.setDescription(en.config.field.description)
								.setDescriptionLocalizations({
									fr: fr.config.field.description
								})
								.setRequired(false)
						)
						.addStringOption(option =>
							option
								.setName("field_type")
								.setDescription(en.config.field.type)
								.setDescriptionLocalizations({
									fr: fr.config.field.type
								})
								.setRequired(false)
								.addChoices(
									{ name: en.config.field.short, value: "short", name_localizations: { fr: fr.config.field.short } },
									{ name: en.config.field.paragraph, value: "paragraph", name_localizations: { fr: fr.config.field.paragraph } }
								))
						.addBooleanOption(option =>
							option
								.setName("field_required")
								.setDescription(en.config.field.required)
								.setDescriptionLocalizations({
									fr: fr.config.field.required
								})
								.setRequired(false)
						)
				)


		),

	async execute(interaction: CommandInteraction) {
		if (!interaction.guildId) return;
		const options = interaction.options as CommandInteractionOptionResolver;
		const subcommand = options.getSubcommand();
		if (subcommand === en.config.new.name) {
			const name = options.getString("name", true);
			const role = [options.getRole("role", true).id];
			const channel = options.getChannel("channel", true).id;
			const threadName = options.getString("thread_name", true);
			const fields = [];
			for (let i = 1; i < 5; i++) {
				const field_name = options.getString(`field_${i}_name`);
				const field_description = options.getString(`field_${i}_description`) ?? "";
				const field_type = options.getString(`field_${i}_type`) ?? "short";
				const field_required = options.getBoolean(`field_${i}_required`) ?? false;
				if (field_name) {
					fields.push({name: field_name, description: field_description, type: field_type, required: field_required} as TemplateModals);
				}
			}
			const template: Ticket = {
				fields,
				roles: role,
				name,
				channel,
				ticketMessage: options.getString("description", true),
				threadName
			};
			await createJSONTemplate(template, interaction.guildId!, interaction.channelId, interaction);
			const fetchedReply = await interaction.fetchReply();
			await createEmbed(interaction, template, fetchedReply.id, interaction.channelId);
			return;

		} else if (subcommand === "role") {
			const message_id = options.getString("message_id", true);
			const choice = options.getString("choice", true) as "add" | "remove";
			//download the previous template
			const template = await downloadJSONTemplate(message_id, interaction);
			if (!template) return;
			const {ticket, message} = template;
			const role = options.getRole("role", true).id;
			switch (choice) {
			case "add":
				addRoleToTemplate(role, ticket, message);
				await interaction.reply({
					content: ln(interaction).edit.role.add.replace("{{role}}", `<@&${role}>`),
				});
				break;
			case "remove":
				if (ticket.roles.length === 1) {
					await interaction.reply({
						content: ln(interaction).error.role.left,
					});
					return;
				}
				if (!ticket.roles.includes(role)) {
					await interaction.reply({
						content: ln(interaction).error.role.notInTemplate.replace("{{role}}", `<@&${role}>`),
					});
					return;
				}
				removeRoleToTemplate(role, ticket, message);
				await interaction.reply({
					content: ln(interaction).edit.role.remove.replace("{{role}}", `<@&${role}>`),
				});
				break;
			}
			return;
		} else if (subcommand === "rename") {
			const message_id = options.getString("message_id", true);
			const thread_name = options.getString("thread_name", true);
			const template = await downloadJSONTemplate(message_id, interaction);
			if (!template) {
				await interaction.reply({
					content: ln(interaction).error.channel,
				});
				return;
			}
			const { ticket, message } = template;
			await renameThread(thread_name, ticket, message);

		}
		const addSubcommandGroup = options.getSubcommandGroup(false);
		if (!addSubcommandGroup) return;
		const addSubcommand = options.getSubcommand(false);
		if (!addSubcommand) return;
		const field = options.getString("field_name", true);
		const message_id = options.getString("message_id", true);
		//download the previous template
		const template = await downloadJSONTemplate(message_id, interaction);
		if (!template) return;
		const {ticket, message} = template;
		switch (addSubcommand) {
		case "remove":
			if (template.ticket.fields.filter(f => f.name === field).length === 0) {
				await interaction.reply({
					content: ln(interaction).error.field.notfound.replace("{{field}}", field),
				});
				return;
			}
			const rep = await removeFieldToTemplate(field, ticket, message);
			if (rep === "deleted") {
				await interaction.reply({
					content: ln(interaction).edit.field.deleted,
				});
			} else {
				await interaction.reply({
					content: ln(interaction).edit.field.removed.replace("{{field}}", field),
				});
			}
			break;
		case "add":
			const fieldDescription = options.getString("field_description") ?? "";
			const fieldType: "short" | "paragraph" = options.getString("field_type") as "short" | "paragraph" ?? "short";
			const fieldRequired = options.getBoolean("field_required") ?? false;
			if (template.ticket.fields.filter(f => f.name === field).length !== 0) {
				await interaction.reply({
					content: ln(interaction).error.field.exist.replace("{{field}}", field),
				});
				return;
			}
			const repAdd = await addFieldToTemplate({
				name: field,
				description: fieldDescription,
				type: fieldType,
				required: fieldRequired
			},
			ticket, message);
			if (repAdd) {
				await interaction.reply({
					content: ln(interaction).edit.field.added.replace("{{field}}", field),
				});
			} else {
				await interaction.reply({
					content: ln(interaction).error.field.tooMuch,
				});
			}
			break;
		case "edit":
			const field_description_edit = options.getString("field_description") ?? "";
			const field_type_edit = options.getString("field_type") ?? "short";
			const field_required_edit = options.getBoolean("field_required") ?? false;
			const fieldToEdit = ticket.fields.find(f => f.name === field);
			if (!fieldToEdit) {
				await interaction.reply({
					content: ln(interaction).error.field.notfound.replace("{{field}}", field),
				});
				return;
			}
			const reply = await editFieldToTemplate({
				name: field,
				description: field_description_edit,
				type: field_type_edit as "short" | "paragraph",
				required: field_required_edit
			},
			ticket, message, interaction);
			if (reply) {
				await interaction.reply({
					content: ln(interaction).edit.field.edited.replace("{{field}}", field),
				});
				return;
			}
			break;
		}
		return;
	}
};


