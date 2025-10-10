import { embedCommands } from "./editEmbed";
import { fields } from "./fields";
import { create } from "./new";
import { pingRole } from "./ping";
import { privateThread } from "./private_thread";
import { rename } from "./rename";
import { role } from "./role";

export const commandsList = [
	fields,
	create,
	rename,
	role,
	embedCommands,
	pingRole,
	privateThread,
];
