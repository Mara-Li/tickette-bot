import { Message } from "discord.js";

import { Ticket } from "../interface";
import { createFile } from "./template";

export async function renameThread(newThreadName: string, template: Ticket, message: Message) {
	template.threadName = newThreadName;
	//remove attachment
	await message.edit({
		files: []
	});
	//add new attachment
	await message.edit({
		files: createFile(template)
	});
	
}