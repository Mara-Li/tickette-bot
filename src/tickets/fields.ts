import { CommandInteraction, Message } from "discord.js";
import { TemplateModals, Ticket } from "../interface";
import { ln } from "../locales";
import { createFile, deleteFile } from "./template";

export async function editFieldToTemplate(field: TemplateModals, template: Ticket, message: Message, interaction: CommandInteraction) {
	const fieldToEdit = template.fields.find(f => f.name === field.name);
	if (!fieldToEdit) {
		await interaction.reply({
			content: ln(interaction).error.field.notfound.replace("{{field}}", field.name),
		});
		return;
	};
	fieldToEdit.description = field.description;
	fieldToEdit.required = field.required;
	fieldToEdit.type = field.type;
	//edit in the template object
	template.fields = template.fields.map(f => {
		if (f.name === field.name) {
			return field;
		}
		return f;
	});
	//remove attachment
	await message.edit({
		files: []
	});
	//add new attachment
	createFile(template, message.guild?.id as string, message.id);
	await message.edit({
		files: [`tickets/${message.guild?.id}/${message.id}.json`]
	});
	deleteFile(message.guild?.id as string, message.id);
	return true;
}

export async function addFieldToTemplate(field: TemplateModals, template: Ticket, message: Message) {
	if (template.fields.length > 5) {
		return false;
	}
	template.fields.push(field);
	//remove attachment
	await message.edit({
		files: []
	});
	//add new attachment
	createFile(template, message.guild?.id as string, message.id);
	await message.edit({
		files: [`tickets/${message.guild?.id}/${message.id}.json`]
	});
	deleteFile(message.guild?.id as string, message.id);
	return true;
}

export async function removeFieldToTemplate(field: string, template: Ticket, message: Message) {
	template.fields = template.fields.filter(f => f.name !== field);
	if (template.fields.length === 0) {
		//delete the message
		await message.delete();
		return "deleted";
	}
	//remove attachment
	await message.edit({
		files: []
	});
	//add new attachment
	createFile(template, message.guild?.id as string, message.id);
	await message.edit({
		files: [`tickets/${message.guild?.id}/${message.id}.json`]
	});
	deleteFile(message.guild?.id as string, message.id);
	return "removed";
}
