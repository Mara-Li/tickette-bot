import * as Djs from "discord.js";
import moment from "moment";

import { DEFAULT_TEMPLATE_VALUE, type Ticket } from "../interface";
import { ln } from "../locales";

const EMBED_COLOR = 0x2f3136 as const;

// Helpers
function isTextChannel(
	channel: Djs.GuildBasedChannel | null | undefined
): channel is Djs.TextChannel {
	// noinspection SuspiciousTypeOfGuard
	return !!channel && channel instanceof Djs.TextChannel;
}

function parseFooterIds(text?: string): { channelId: string; messageId: string } | null {
	if (!text) return null;
	const parts = text.split(" : ");
	if (parts.length < 2) return null;
	const [channelId, messageId] = parts;
	if (!channelId || !messageId) return null;
	return { channelId, messageId };
}

function mentionRolesString(roleIds: string[]): string {
	return roleIds.map((role) => `<@&${role}>`).join(" ");
}

async function sendRoleMentions(
	thread: Djs.PrivateThreadChannel | Djs.PublicThreadChannel<false>,
	roleIds: string[],
	persist: boolean
) {
	const content = mentionRolesString(roleIds);
	if (!persist) {
		const msg = await thread.send({ content: "_ _" });
		await msg.edit({ content });
		await msg.delete();
		return;
	}
	await thread.send({ content });
}

function computeThreadName(
	baseName: string,
	interaction: Djs.ModalSubmitInteraction | Djs.ButtonInteraction,
	template: Ticket
): string {
	let name = baseName || "Ticket";

	// Replace from modal fields if present
	if (interaction.isModalSubmit()) {
		const fields = interaction.fields.fields;
		name = name.replace(/{{([^{}]*)}}/g, (match, p1: string) => {
			const field = fields.find((f) => f.customId.toLowerCase() === p1.toLowerCase());
			if (field) {
				const templateField = template.fields.find((f) => f.id === field.customId);
				if (!templateField) return match;
				const type = templateField.type;
				switch (type) {
					case "paragraph":
						return interaction.fields.getTextInputValue(field.customId);
					case "short":
						return interaction.fields.getTextInputValue(field.customId);
					case "user": {
						const users = interaction.fields.getSelectedUsers(field.customId)?.first();
						return users?.username || match;
					}
					case "role": {
						const roles = interaction.fields.getSelectedRoles(field.customId)?.first();
						return roles?.name || match;
					}
					case "channel": {
						const channels = interaction.fields
							.getSelectedChannels(field.customId)
							?.first();
						return channels?.name || match;
					}
					case "mention": {
						const mentions = interaction.fields.getSelectedMentionables(field.customId);
						if (mentions) {
							const { users, roles, members } = mentions;
							const all = [
								...users.map((x) => x.username),
								...roles.map((x) => x?.name),
								...members.map((x) => (x as Djs.GuildMember)?.user.username),
							].filter((x): x is string => x !== undefined && x !== null);
							return all[0] || match;
						}
						return match;
					}
					default:
						return match;
				}
			}
			return match;
		});
	}

	// Replace default template placeholders
	const templateValue = DEFAULT_TEMPLATE_VALUE(
		moment().format("DD/MM/YYYY"),
		moment().format("HH:mm"),
		interaction
	);

	name = name.replace(/{{([^{}]*)}}/g, (match, p1: string) => {
		return templateValue[p1.toLowerCase() as keyof typeof templateValue] || match;
	});
	return name;
}

function buildResponseEmbed(
	ul: ReturnType<typeof ln>,
	interaction: Djs.ModalSubmitInteraction | Djs.ButtonInteraction,
	template: Ticket
): Djs.EmbedBuilder | null {
	if (!interaction.isModalSubmit()) return null;

	const response = new Djs.EmbedBuilder()
		.setTitle(ul("modal.ticket"))
		.setDescription(ul("modal.description", { user: interaction.user.displayName }))
		.setAuthor({
			name: interaction.user.username,
			iconURL: interaction.user.displayAvatarURL(),
		})
		.setColor(EMBED_COLOR)
		.setTimestamp();

	const fields = interaction.fields.fields;
	for (const field of fields.values()) {
		const temp = template.fields.find((f) => f.id === field.customId);
		const name = temp?.name ?? field.customId;
		switch (temp?.type) {
			case "paragraph":
			case "short": {
				response.addFields({
					name,
					value: (field as Djs.TextInputModalData).value,
					inline: true,
				});
				break;
			}
			case "user": {
				const users = interaction.fields
					.getSelectedUsers(field.customId)
					?.filter((u) => u != null);
				if (users?.size)
					response.addFields({
						name,
						value: users.map((u) => `<@${u.id}>`).join(", "),
						inline: true,
					});
				break;
			}
			case "role": {
				const roles = interaction.fields
					.getSelectedRoles(field.customId)
					?.filter((r) => r !== null);
				if (roles?.size)
					response.addFields({
						name,
						value: roles.map((r) => `<@&${r.id}>`).join(", "),
						inline: true,
					});
				break;
			}
			case "channel": {
				const channels = interaction.fields.getSelectedChannels(field.customId);
				if (channels?.size)
					response.addFields({
						name,
						value: channels.map((c) => `<#${c.id}>`).join(", "),
						inline: true,
					});
				break;
			}
			case "mention": {
				const mentions = interaction.fields.getSelectedMentionables(field.customId);
				if (mentions) {
					const { roles, members } = mentions;
					const all = [
						...roles.map((x) => x?.id),
						...members.map((x) => (x as Djs.GuildMember)?.id),
					].filter((x): x is string => x != null);
					//remove duplicates
					const uniqueAll = Array.from(new Set(all));
					if (uniqueAll.length)
						response.addFields({
							name,
							value: uniqueAll.map((m) => `<@${m}>`).join(", "),
							inline: true,
						});
				}
				break;
			}
			default:
				break;
		}
	}
	return response;
}

export async function createEmbed(
	interaction: Djs.CommandInteraction,
	ticket: Ticket,
	messageId: string,
	channelId: string
) {
	const lg = ln(interaction.locale);
	const channel: Djs.GuildBasedChannel | Djs.TextChannel | undefined = ticket.channel
		? interaction.guild?.channels.cache.get(ticket.channel)
		: (interaction.channel as Djs.GuildBasedChannel);
	if (!isTextChannel(channel)) return;

	const embed = {
		title: ticket.name,
		description: ticket.description,
		color: EMBED_COLOR,
		footer: { text: `${channelId} : ${messageId}` },
	};
	const createTicket = new Djs.ButtonBuilder()
		.setCustomId("createTicket")
		.setLabel(`📝 ${lg("modal.button")}`)
		.setStyle(Djs.ButtonStyle.Primary);

	return await channel.send({
		embeds: [embed],
		components: [
			new Djs.ActionRowBuilder<Djs.ButtonBuilder>().addComponents(createTicket),
		],
	});
}

export async function getTemplateByIds(
	messageId: string,
	channelId: string,
	guild: Djs.Guild
) {
	await guild.channels.fetch();
	const channel = await guild.channels.fetch(channelId);
	if (!isTextChannel(channel)) return;
	await channel.messages.fetch();
	const message = await channel.messages.fetch(messageId);
	if (!message) return;
	const attachment = message.attachments.first();
	if (!attachment) return;

	const response = await fetch(attachment.url);
	return (await response.json()) as Ticket;
}

export async function createModal(command: Djs.ButtonInteraction, ticket: Ticket) {
	const lang = ln(command.locale);
	const modal = new Djs.ModalBuilder()
		.setCustomId("ticket")
		.setTitle(lang("modal.ticket"));
	const labels: Djs.LabelBuilder[] = [];
	for (const field of ticket.fields) {
		const type = field.type;
		const label: Djs.LabelBuilder = new Djs.LabelBuilder()
			.setLabel(field.name)
			.setDescription(field.description);
		switch (type) {
			case "short":
			case "paragraph": {
				const inputStyle = label.setTextInputComponent((input) =>
					input
						.setCustomId(field.id)
						.setRequired(field.required)
						.setStyle(
							field.type === "short"
								? Djs.TextInputStyle.Short
								: Djs.TextInputStyle.Paragraph
						)
				);
				labels.push(inputStyle);
				break;
			}
			case "user": {
				const userSelect: Djs.LabelBuilder = label.setUserSelectMenuComponent((menu) =>
					menu.setCustomId(field.id).setRequired(field.required).setMaxValues(25)
				);
				labels.push(userSelect);
				break;
			}
			case "role": {
				const roleSelect: Djs.LabelBuilder = label.setRoleSelectMenuComponent((menu) =>
					menu.setCustomId(field.id).setRequired(field.required).setMaxValues(25)
				);
				labels.push(roleSelect);
				break;
			}
			case "channel": {
				const channelSelect: Djs.LabelBuilder = label.setChannelSelectMenuComponent(
					(menu) =>
						menu.setCustomId(field.id).setRequired(field.required).setMaxValues(25)
				);
				labels.push(channelSelect);
				break;
			}
			case "mention": {
				const mentionSelect: Djs.LabelBuilder = label.setMentionableSelectMenuComponent(
					(menu) =>
						menu.setCustomId(field.id).setRequired(field.required).setMaxValues(25)
				);
				labels.push(mentionSelect);
				break;
			}
			default:
				break;
		}
	}
	modal.setLabelComponents(...labels);
	await command.showModal(modal);
}

export async function createThread(
	sourceEmbed: Djs.Embed,
	interaction: Djs.ModalSubmitInteraction | Djs.ButtonInteraction
) {
	const ul = ln(interaction?.guild?.preferredLocale ?? interaction.locale);
	const ids = parseFooterIds(sourceEmbed?.footer?.text);
	if (!ids) {
		await interaction.reply({
			content: ul("error.footer"),
			flags: Djs.MessageFlags.Ephemeral,
		});
		return;
	}

	const template = await getTemplateByIds(
		ids.messageId,
		ids.channelId,
		interaction.guild as Djs.Guild
	);
	if (!template) {
		await interaction.reply({
			content: ul("error.attachment"),
			flags: Djs.MessageFlags.Ephemeral,
		});
		return;
	}

	const newThreadName = computeThreadName(
		template.threadName || "Ticket",
		interaction,
		template
	);
	const channelToCreateThread = interaction.channel as Djs.TextChannel;
	const thread = (await channelToCreateThread.threads.create({
		name: newThreadName || "Ticket",
		reason: ul("reason", { nickname: interaction.user.username }),
		type: Djs.ChannelType.PrivateThread,
		invitable: false,
	})) as Djs.PrivateThreadChannel;

	await interaction.reply({ content: ul("created"), flags: Djs.MessageFlags.Ephemeral });
	await thread.members.add(interaction.user.id);

	await sendRoleMentions(thread, template.roles, !!template.ping);

	const responseEmbed = buildResponseEmbed(ul, interaction, template);
	if (responseEmbed) {
		await thread.send({ embeds: [responseEmbed] });
	}
}
