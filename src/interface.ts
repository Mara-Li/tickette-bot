import type {
	ButtonInteraction,
	GuildMember,
	Message,
	ModalSubmitInteraction,
	TextChannel,
} from "discord.js";

/**
 * The type of the input field
 * - short: single line input
 * - paragraph: multi line input
 * - user: user select
 * - role: role select
 * - channel: channel select
 * - mention: mention select
 */
export type TemplateType =
	| "short"
	| "paragraph"
	| "user"
	| "role"
	| "channel"
	| "mention";

export interface TemplateModals {
	name: string;
	description: string;
	type: TemplateType;
	required: boolean;
	id: string;
}

export interface ParseLink {
	channel?: TextChannel;
	message?: Message;
	guild: string;
}

export interface Ticket {
	fields: TemplateModals[];
	description?: string;
	roles: string[]; // role id
	name?: string;
	channel?: string;
	threadName: string;
	ping?: boolean;
}

interface TemplateDefaultValue {
	date: string;
	time: string;
	// biome-ignore lint/style/useNamingConvention: djs doesn't respect convention
	user_id: string;
	nickname: string;
	username: string;
	display: string;
}

export const DEFAULT_TEMPLATE_VALUE = (
	date: string,
	time: string,
	interaction: ButtonInteraction | ModalSubmitInteraction
): TemplateDefaultValue => {
	return {
		date: date,
		time: time,
		// biome-ignore lint/style/useNamingConvention: djs doesn't respect convention
		user_id: interaction.user.id,
		nickname: interaction.user.displayName,
		username: interaction.user.username,
		display:
			(interaction.member as GuildMember)?.displayName || interaction.user.displayName,
	};
};
