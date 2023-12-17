/**
 * @module tickets/template
 * @desc Allow to create and save a template for ticket creation
 * The template is created using the command : /ticket config <channelSaved> <thread>
 * The ticket is saved as an embed, so no database is used
 * Limitation:
 * - No more than 5 fields
 * - Only short fields are used
 * Field form: Template[]
 *
*/
import fs from "fs";
import { TemplateModals, Ticket } from "../interface";
import { CommandInteraction, Message } from "discord.js";
import { ln } from "../locales";

export function createFile(template: Ticket, serverID: string, channelID: string) {
	const tmpFileContent = JSON.stringify(template, null, 2)
	if (fs.existsSync(`tickets/${serverID}/${channelID}.json`)) {
		fs.rmSync(`tickets/${serverID}/${channelID}.json`);
	}
	fs.mkdirSync(`tickets/${serverID}`, { recursive: true });
	fs.writeFile(`tickets/${serverID}/${channelID}.json`, tmpFileContent, (err) => {
		if (err) {
			console.error(err);
		}
	}
	);
}

export function deleteFile(serverID: string, channelID: string) {
	fs.rmSync(`tickets/${serverID}/${channelID}.json`);
	if (fs.readdirSync(`tickets/${serverID}`).length === 0) {
		fs.rmdirSync(`tickets/${serverID}`);
	}
}

export async function createJSONTemplate(
	name: string,
	role: string[],
	fields: TemplateModals[],
	serverID: string,
	channelID: string,
	interaction: CommandInteraction
) {
	createFile({ name, roles: role, fields }, serverID, channelID);
	await interaction.reply({
		content: ln(interaction).new.success,
		files: [`tickets/${serverID}/${channelID}.json`]
	})
	deleteFile(serverID, channelID);
};

export async function downloadJSONTemplate(
	messageID: string,
	interaction: CommandInteraction
) {
	//search the message
	if (!interaction.channel) return;
	const message = await interaction.channel.messages.fetch(messageID);
	if (!message) {
		await interaction.reply({
			content: ln(interaction).error.channel,
		});
		return;
	}
	//search the file
	const attachment = message.attachments.first();
	if (!attachment) {
		await interaction.reply({
			content: ln(interaction).error.attachment,
		});
		return;
	}
	const response = await fetch(attachment.url);
	return {
		ticket : await response.json() as Ticket,
		message
	};
}



