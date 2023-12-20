import { Client, GatewayIntentBits, Partials } from "discord.js";
import dotenv from "dotenv";
import * as process from "process";

import * as pkg from "../package.json";
import interaction from "./events/interaction";
import join from "./events/join";
import ready from "./events/ready";

if (process.env.ENV === "production") {
	dotenv.config({ path: ".env.prod" });
} else {
	dotenv.config({ path: ".env" });
}

export const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
	],
	partials: [
		Partials.Channel,
		Partials.GuildMember,
		Partials.User
	],
});

export const VERSION = pkg.version ?? "0.0.0";
export const CHANNEL_ID = process.env.CHANNEL_ID ?? "0";
export const prod = process.env.NODE_ENV === "production";

try {
	ready(client);
	interaction(client);
	join(client);
}
catch (error) {
	console.error(error);
}


client.login(process.env.DISCORD_TOKEN);