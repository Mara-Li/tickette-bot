import type {
	ButtonInteraction,
	CacheType,
	GuildMember,
	Message,
	ModalSubmitInteraction,
	TextChannel,
} from "discord.js";

export interface TemplateModals {
	name: string;
	description: string;
	type: "short" | "paragraph";
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
	user_id: string;
	nickname: string;
	username: string;
	display: string;
}

export const DEFAULT_TEMPLATE_VALUE = (
	date: string,
	time: string,
	interaction: ButtonInteraction<CacheType> | ModalSubmitInteraction<CacheType>
): TemplateDefaultValue => {
	return {
		date: date,
		time: time,
		user_id: interaction.user.id,
		nickname: interaction.user.displayName,
		username: interaction.user.username,
		display:
			(interaction.member as GuildMember)?.displayName || interaction.user.displayName,
	};
};
