import { Message } from "discord.js";

import { Ticket } from "../interface";
import { createFile, deleteFile } from "./template";

export async function addRoleToTemplate(role: string, template: Ticket, message: Message) {
	template.roles.push(role);
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
}

export async function removeRoleToTemplate(role: string, template: Ticket, message: Message) {
	template.roles = template.roles.filter(r => r !== role);
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
}
