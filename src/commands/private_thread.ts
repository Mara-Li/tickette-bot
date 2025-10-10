/**
 * Allow to create a private thread in any channel and invite mentionnable roles
 * Usage: /private_thread <thread_name> <Message> ...
 * Limitation: The bot needs the permission to create a thread in the channel
 * It opens a modal to enter the mentionnable roles
 */

import * as Djs from "discord.js";
import i18next from "i18next";
import { cmdLn, ln } from "../locales";

const t = i18next.getFixedT("en");

export const privateThread = {
	data: new Djs.SlashCommandBuilder()
		.setName(t("private_thread.name"))
		.setDescription(t("private_thread.description"))
		.setNameLocalizations(cmdLn("private_thread.name"))
		.setDescriptionLocalizations(cmdLn("private_thread.description"))
		.addStringOption((option) =>
			option
				.setName(t("private_thread.thread_name.name"))
				.setDescription(t("private_thread.thread_name.description"))
				.setNameLocalizations(cmdLn("private_thread.thread_name.name"))
				.setDescriptionLocalizations(cmdLn("private_thread.thread_name.description"))
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName(t("private_thread.message.name"))
				.setDescription(t("private_thread.message.description"))
				.setNameLocalizations(cmdLn("private_thread.message.name"))
				.setDescriptionLocalizations(cmdLn("private_thread.message.description"))
				.setRequired(false)
		),
	execute: async (interaction: Djs.ChatInputCommandInteraction) => {
		if (!interaction.guild || !interaction.channel || !interaction.member) return;
		const channel = getChannel(interaction.channel);
		const lg = ln(interaction.locale);
		if (!channel) {
			await interaction.reply({
				content: lg("private_thread.invalid"),
				flags: Djs.MessageFlags.Ephemeral,
			});
			return;
		}

		const threadName = interaction.options.getString(
			t("private_thread.thread_name.name"),
			true
		);
		const message =
			interaction.options.getString(t("private_thread.message.name"), false) ?? undefined;
		//open a modal to enter the mentionnable roles
		const modal = new Djs.ModalBuilder()
			.setTitle(lg("private_thread.modal.title"))
			.setCustomId("private_thread")
			.addLabelComponents((label) =>
				label
					.setLabel(lg("private_thread.modal.label"))
					.setMentionableSelectMenuComponent((comp) =>
						comp
							.setCustomId("private_thread_mentionable")
							.setMaxValues(25)
							.setRequired(false)
					)
			);
		await interaction.showModal(modal);

		const filter = (i: Djs.ModalSubmitInteraction) =>
			i.customId === modal.data.custom_id && i.user.id === interaction.user.id;

		const modalSubmit = await interaction.awaitModalSubmit({ filter, time: 60000 });
		if (!modalSubmit) {
			await interaction.reply({
				content: lg("private_thread.modal.no_response"),
				flags: Djs.MessageFlags.Ephemeral,
			});
			return;
		}
		const mentions = modalSubmit.fields.getSelectedMentionables(
			"private_thread_mentionable",
			false
		);

		if (mentions) {
			await modalSubmit.reply({
				content: lg("private_thread.creating", { threadName }),
				flags: Djs.MessageFlags.Ephemeral,
			});
			const thread = await channel.threads.create({
				name: threadName,
				autoArchiveDuration: Djs.ThreadAutoArchiveDuration.OneHour,
				type: Djs.ChannelType.PrivateThread,
				invitable: true,
				reason: lg("private_thread.audit", { user: interaction.user.globalName }),
			});

			//collect all user with specifics roles
			const usersToAdd: Set<string> = new Set();
			// Add the interaction user first
			usersToAdd.add(interaction.user.id);

			// Add all users from selected roles
			if (mentions.roles.size > 0) {
				// Fetch all guild members to ensure we have the complete list
				await interaction.guild.members.fetch();

				for (const [, role] of mentions.roles) {
					if (!role || !(role instanceof Djs.Role)) continue;
					for (const [, member] of role.members) {
						usersToAdd.add(member.id);
					}
				}
			}

			// Add all directly mentioned members
			if (mentions.members.size > 0) {
				for (const [, member] of mentions.members) {
					if (!member || !(member instanceof Djs.GuildMember)) continue;
					usersToAdd.add(member.id);
				}
			}

			//add users to the thread in parallel using Promise.all
			await Promise.all(
				Array.from(usersToAdd).map((userId) => thread.members.add(userId))
			);
		}
	},
};

function getChannel(channel: Djs.GuildBasedChannel | Djs.TextBasedChannel) {
	if (channel.isThread() && channel.parent) return getChannel(channel.parent);
	//we want only a channel where we can create a thread
	if (channel.type === Djs.ChannelType.GuildText) return channel;
	return null;
}
