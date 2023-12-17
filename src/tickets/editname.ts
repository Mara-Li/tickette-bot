import { Message } from "discord.js";

import { Ticket } from "../interface";
import { createFile, deleteFile } from "./template";

export async function renameThread(newThreadName: string, template: Ticket, message: Message) {
	template.threadName = newThreadName;
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