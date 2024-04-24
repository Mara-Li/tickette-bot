import {Message } from "discord.js";

import { TemplateModals, Ticket } from "../interface";
import { createFile } from "./template";

export async function editFieldToTemplate(field: TemplateModals, template: Ticket, message: Message, fieldToEdit: TemplateModals) {

	fieldToEdit.name = field.name;
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
	await message.edit({
		files: createFile(template)
	});
	return true;
}

export async function editChannelToTemplate(template: Ticket, message: Message) {
	//remove attachment
	await message.edit({
		files: []
	});
	//add new attachment
	await message.edit({
		files: createFile(template)
	});
	return true;

}

export async function addFieldToTemplate(field: TemplateModals, template: Ticket, message: Message) {
	if (template.fields.length === 5) {
		return false;
	}
	template.fields.push(field);
	//remove attachment
	await message.edit({
		files: []
	});
	//add new attachment
	await message.edit({
		files: createFile(template)
	});
	return true;
}

export async function removeFieldToTemplate(field: string, template: Ticket, message: Message) {
	template.fields = template.fields.filter(f => f.id !== field);
	//remove attachment
	await message.edit({
		files: []
	});
	//add new attachment
	await message.edit({
		files: createFile(template)
	});
	return;
}
