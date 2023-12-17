export interface TemplateModals {
	name: string;
	description: string;
	type: "short" | "paragraph";
	required: boolean;
}

export interface Ticket {
	fields: TemplateModals[];
	ticketMessage: string;
	roles: string[]; // role id
	name: string;
	channel: string;
	threadName: string;
}



