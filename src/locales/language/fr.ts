export default {
	common: {
		role: "role",
		field: "champs",
	},
	created: "Ticket créé !",
	reason: "Ticket créé par {{nickname}}",
	error: {
		channel: "Erreur lors de l'édition du template : message non trouvé. Vous devez utiliser la commande dans le même channel que le JSON du template.",
		attachment: "Erreur lors de l'édition du template : le message n'a pas de fichier joint.",
		footer: "Erreur lors de l'édition du template : le footer de l'embed n'a pas le bon format.",
		administrator: "Merci de contacter un administrateur pour éditer le template.",
		field: {
			"notfound": "Erreur lors de l'édition du template : le champ n'a pas été trouvé.",
			"exist": "Erreur lors de l'édition du template : le champ existe déjà.",
			"tooMuch" : "Erreur lors de l'édition du template : le template a trop de champs. Vous ne pouvez pas avoir plus de 5 champs.",
		},
		role: {
			left: "Impossible de supprimer le rôle {{role}} car c'est le seul restant.",
			notInTemplate: "Le rôle {{role}} n'est pas dans le template."
		}
	},
	modal: {
		ticket: "Nouveau ticket",
		button: "Créer un nouveau ticket",
		description: "{{user}} a créé un nouveau ticket !\n Voici les informations fournies par l'utilisateur :",
	},
	new: {
		success: "Template créé avec succès",
		name: "nouveau",
		description: "Créer une nouvelle template",
		embed: {
			name: "titre",
			description: "Le titre de l'embed",
		},
		thread_name: {
			name: "thread_name",
			description: "Le nom du thread. Les variables peuvent être transformée avec {{valeur}}",
		},
		role: {
			description: "Le rôle des personnes qui doivent être ajoutées à la template",
		},
		embed_content: {
			name: "description",
			description: "Le message dans l'embed",
		},
		channel: {
			name: "channel",
			description: "Le channel où le ticket sera créé",
		},
	},
	edit: {
		role: {
			add: "Rôle {{role}} ajouté avec succès",
			remove: "Rôle {{role}} supprimé avec succès",
		},
		field: {
			deleted : "Le template est supprimé car il n'y a plus de champs",
			edited : "Champ {{field}} édité avec succès",
			removed : "Champ {{field}} supprimé avec succès",
			added: "Champ {{field}} ajouté avec succès",
		}
	},
	title: "config",
	description: "Configuration des tickets",
	field: {
		name: "Le nom du champ",
		description: "La description du champ",
		type: "Le type du champ, paragraphe ou court",
		required: "Le champ est-il obligatoire ?",
		short: "Court",
		paragraph: "Paragraphe",
		id: "L'ID du champ, gardez-le court et simple. Utiliser le champ dans le nom du thread avec {{nom}}.",
	},

	message_id: {
		name: "message_id",
		description: "L'ID du message où le JSON de la template est envoyée",
	},
	role: {
		description: "Ajouter ou supprimer un rôle de la template",
		choice: {
			name: "action",
			description: "L'action à effectuer",
			add: "Ajouter",
			remove: "Supprimer",
		},
		role: {
			description: "Le rôle à ajouter ou supprimer",
		}
	},
	rename: {
		title: "renommer",
		description: "Modifier la template du nom du ticket"
	},
	fields: {
		title: "champs",
		description: "Modifier les champs de la template",
		name: {
			name: "field_id",
			description: "L'id du champ, gardez-le court et simple. Utiliser le champ dans le nom du thread avec {{valeur}}",
		},
		remove: {
			name: "supprimer",
			description: "Supprimer un champ de la template",
		},
		add: {
			name: "ajouter",
			description: "Ajouter un champ à la template",
		},
		edit: {
			name: "modifier",
			description: "Modifier un champ de la template",
		},
	},
	embed: {
		name: "embed",
		description: "Modifier ou renvoyer l'embed pour la création de ticket",
		edit: {
			name: "modifier",
			description: "Modifier l'embed pour la création de ticket",
			message_id: {
				name: "message_id",
				description: "L'ID du message de l'embed. Vous devez utiliser la commande dans le même channel que l'embed.",
			},
			channel: {
				name: "channel",
				description: "Le channel où l'embed peut être renvoyé (supprimera l'ancien)",
			},
			content: {
				name: "description",
				description: "La contenu de l'embed",
			},
			title: {
				name: "titre",
				description: "Le titre de l'embed",
			},
			color: {
				name: "couleur",
				description: "La couleur de l'embed. Accepte des valeurs hexadecimal, rgb ou un nom de couleur",
			},
			thumbnail: {
				name: "thumbnail",
				description: "L'image à ajouter à l'embed",
			},
			error: {
				textChannel: "Cette commande ne peut être utilisée que dans un channel.",
				notFound: "Le message n'a pas été trouvé : vous devez utiliser la commande dans le même channel que l'embed.",
				noEmbed: "Le message n'a pas d'embed.",
				invalidColor: "La couleur n'est pas valide. Merci d'utiliser une valeur hexadécimal, un [nom de couleur depuis cette liste](https://old.discordjs.dev/#/docs/discord.js/main/typedef/Colors) ou une valeur rgb.",
			},
			success: {
				jump: "Embed modifié.\n[Cliquez ici pour voir le message]({{url}})",
				simple: "Embed modifié."
			}
		},
		resend: {
			name: "recréé",
			description: "Recréer l'embed dans un channel depuis la template",
			channel: "Le channel où l'embed doit être re-créé",
			error: {
				textChannel: "Cette commande ne peut être utilisée que dans un channel.",
				notFound: "Le message n'a pas été trouvé : vous devez utiliser la commande dans le même channel que l'embed.",
				notSend: "Le message n'a pas été envoyé pour une raison inconnue.",
			}
		}
	}
};