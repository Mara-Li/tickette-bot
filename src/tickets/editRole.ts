import type { Message } from "discord.js";

import type { Ticket } from "../interface";
import { createFile } from "./template";

export async function addRoleToTemplate(
	role: string,
	template: Ticket,
	message: Message
) {
	template.roles.push(role);
	//remove attachment
	await message.edit({
		files: [],
	});
	//add new attachment
	await message.edit({
		files: createFile(template),
	});
}

export async function removeRoleToTemplate(
	role: string,
	template: Ticket,
	message: Message
) {
	template.roles = template.roles.filter((r) => r !== role);
	//remove attachment
	await message.edit({
		files: [],
	});
	//add new attachment
	await message.edit({
		files: createFile(template),
	});
}
