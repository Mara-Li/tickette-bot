import {
	CommandInteraction,
	CommandInteractionOptionResolver,
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder
} from "discord.js";
import { TemplateModals } from "../interface";
import { createJSONTemplate, downloadJSONTemplate } from "../tickets/template";
import { addRoleToTemplate, removeRoleToTemplate } from "../tickets/editRole";
import { ln } from "../locales";
import { addFieldToTemplate, editFieldToTemplate, removeFieldToTemplate } from "../tickets/fields";

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
				.setDescription("The name of the field")
				.setRequired(false))
		.addStringOption(option =>
			option
				.setName(`field_${nb}_description`)
				.setDescription("The description of the field")
				.setRequired(false))
		.addStringOption(option =>
			option
				.setName(`field_${nb}_type`)
				.setDescription("The type of the field")
				.setRequired(false)
				.addChoices(
					{name: "short", value: "short"},
					{name: "paragraph", value: "paragraph"}
			))
		.addBooleanOption(option =>
			option
				.setName(`field_${nb}_required`)
				.setDescription("The field is required during ticket creation modal")
				.setRequired(false)
		);
}


export const config = {
	data: new SlashCommandBuilder()
		.setName("config")
		.setDescription("Ticket configuration")
		.addSubcommand((group => {
			let grp = group
				.setName("new")
				.setDescription("Create a new template")
				.addStringOption(option =>
					option
						.setName("name")
						.setDescription("The name of the created ticket")
						.setRequired(true)
				)
				.addRoleOption(option =>
					option
						.setName("role")
						.setDescription("The role of people that need to be added to the ticket")
						.setRequired(true)
				)

			//add the five duplicate field using field function
			for (let i = 1; i < 5; i++) {
				grp = field(grp, i);
			}
			return grp;
		})
		)
		.addSubcommand(group =>
			group
				.setName("role")
				.setDescription("Edit the role of the template")
				.addStringOption(option =>
					option
						.setName("message_id")
						.setDescription("The message ID of the template")
						.setRequired(true)
				)
				.addStringOption(option =>
					option
						.setName("choice")
						.setDescription("The choice to edit the role")
						.setRequired(true)
						.addChoices(
							{name: "Add", value: "add"},
							{name: "Remove", value: "remove"},
						)
				)
				.addRoleOption(option =>
					option
						.setName("role")
						.setDescription("The role to add or remove")
						.setRequired(true)
				)
	)
	.addSubcommandGroup(group =>
		group
			.setName("template")
			.setDescription("Edit a template")
			.addSubcommand(sub =>
				sub
					.setName("remove")
					.setDescription("Remove a field from the template")
					.addStringOption(option =>
						option
							.setName("message_id")
							.setDescription("The message ID of the template")
							.setRequired(true)
					)
					.addStringOption(option =>
						option
							.setName("field_name")
							.setDescription("The name of the field to remove")
							.setRequired(true)
					)
			)
			.addSubcommand(sub =>
				sub
					.setName("add")
					.setDescription("Add a field to the template")
					.addStringOption(option =>
						option
							.setName("message_id")
							.setDescription("The message ID of the template")
							.setRequired(true)
					)
					.addStringOption(option =>
						option
							.setName("field_name")
							.setDescription("The name of the field to add")
							.setRequired(true)
					)
					.addStringOption(option =>
						option
							.setName("field_description")
							.setDescription("The description of the field")
							.setRequired(false)
					)
					.addStringOption(option =>
						option
							.setName("field_type")
							.setDescription("The type of the field")
							.setRequired(false)
							.addChoices(
								{name: "short", value: "short"},
								{name: "paragraph", value: "paragraph"}
						))
					.addBooleanOption(option =>
						option
							.setName("field_required")
							.setDescription("The field is required during ticket creation modal")
							.setRequired(false)
					)
			)
			.addSubcommand(sub =>
				sub
					.setName("edit")
					.setDescription("Edit a field from the template")
					.addStringOption(option =>
						option
							.setName("message_id")
							.setDescription("The message ID of the template")
							.setRequired(true)
					)
					.addStringOption(option =>
						option
							.setName("field_name")
							.setDescription("The name of the field to edit")
							.setRequired(true)
					)
					.addStringOption(option =>
						option
							.setName("field_description")
							.setDescription("The new description of the field")
							.setRequired(false)
					)
					.addStringOption(option =>
						option
							.setName("field_type")
							.setDescription("The new type of the field")
							.setRequired(false)
							.addChoices(
								{name: "short", value: "short"},
								{name: "paragraph", value: "paragraph"}
						))
					.addBooleanOption(option =>
						option
							.setName("field_required")
							.setDescription("The field is required during ticket creation modal")
							.setRequired(false)
					)
			)


		),

	async execute(interaction: CommandInteraction) {
		if (!interaction.guildId) return;
		const options = interaction.options as CommandInteractionOptionResolver;
		const subcommand = options.getSubcommand();
		if (subcommand === "new") {
			const name = options.getString("name", true);
			const role = [options.getRole("role", true).id];
			const fields = [];
			for (let i = 1; i < 5; i++) {
				const field_name = options.getString(`field_${i}_name`);
				const field_description = options.getString(`field_${i}_description`) ?? "";
				const field_type = options.getString(`field_${i}_type`) ?? "short";
				const field_required = options.getBoolean(`field_${i}_required`) ?? false;
				if (field_name) {
					fields.push({name: field_name, description: field_description, type: field_type, required: field_required} as TemplateModals);
				}
				await createJSONTemplate(name, role, fields, interaction.guildId!, interaction.channelId, interaction);
				return;
			}
		} else if (subcommand === "role") {
			const message_id = options.getString("message_id", true);
			const choice = options.getString("choice", true) as "add" | "remove";
			//download the previous template
			const template = await downloadJSONTemplate(message_id, interaction)
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
				const field_description = options.getString("field_description") ?? "";
				const field_type: "short" | "paragraph" = options.getString("field_type") as "short" | "paragraph" ?? "short";
				const field_required = options.getBoolean("field_required") ?? false;
				if (template.ticket.fields.filter(f => f.name === field).length !== 0) {
					await interaction.reply({
						content: ln(interaction).error.field.exist.replace("{{field}}", field),
					});
					return;
				}
				const repAdd = await addFieldToTemplate({
					name: field,
					description: field_description,
					type: field_type,
					required: field_required
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
				};
				const reply = await editFieldToTemplate({
					name: field,
					description: field_description_edit,
					type: field_type_edit as "short" | "paragraph",
					required: field_required_edit
				},
				ticket, message, interaction)
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
}


