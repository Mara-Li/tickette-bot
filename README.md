-> [Invite the bot](https://discord.com/api/oauth2/authorize?client_id=1186067111760629812&permissions=395137248256&scope=bot+applications.commands)


Ticket+ is a bot that allows to create template for ticket creation. When clicking on the embed, a modals will be opened and the user that triggered it can fill some informations you choose.
Thereafter, theses informations can be used for the ticket name generation.

Ticket are created as thread, so you can manage them easy by archive, adding user, delete…

> [!warning]
> The bot doesn't use ANY DATABASE. It is better for security. As a fallback, the template are save into your own server, in a JSON file send as an attachment. 

> [!important]
> Command can only be used by user that have the `Manage channel` permissions.

# Template and fields definition

> [!note]  
> A "template" is a model. The template contains :
> - The futur thread name;
> - The role(s) that must be added
> - Optional fields

The template can contains **fields**. Fields allow to design value for the thread name. These value will be replaced by the bot when the user fill the modals that will be prompted when they click on the "open ticket" button.

Each fields contains :
- An `id` ; Mandatory : it allows to define the `{{value}}` used in the thread name;
- A `name` : It is the questions asked in the modals ; Can't be more long than 45 characters.
- An (optional) `description` : It is the placeholder or a description for the field
- An (optional) `required` : If the field **needs** to be fill before sending (default: `false`).
- And an optional `type`. Type correspond to "**short**" or "**paragraph**". Paragraph reply will be cropped if used in the thread-name generation (default: `short`).

> [!tip]
> If you set a fields with :
> - id: `type`
> - name: "What is your problem ?"
> - type: `short` (default)
> - required: `true`
> - placeholder: "My problems concern …"
>
> You choosen a thread-name like this: `{{type}} | {{nickname}}`
> - `{{type}}` : Will be replaced by the user value of the modal. For example, "My problem concern some mathematics"
> - `{{nickname}}` : Will be replaced by the global name of the user.

## Default template

The thread-name can take default template, that are:
- `{{nickname}}` : The global name of the user
- `{{username}}` : The "pomelo" of the user
- `{{display}}` : The nickname of the user on the server (if any) or the global name
- `{{user_id}}` : The discord Snowflake id.
- `{{date}}` : The date (in form of "YYYY-MM-dd")
- `{{time}}` : The time (in form of "HH:mm")

# Usage

You can define multiple template without problem. You need to know :
- Template are saved in a `json`, in the channel when you used the commands. It prevents the usage of a database, and allow to save your settings on your own guild.
- The template will be pinned to help you to find it if you need to edit.
- There is no commands for closing/deleting or adding user in the thread, as I think the discord methods easier.
- To edit a template, you need the id or the link to the message. For that, you need to be in developer mode, right-click on the message and "copy the id". If you use the message identifiant, you need to use the commands in the same channel.
- The footer of the embed contains the channel_id and message_id of the template, and can't be edited by the others commands.

## Create a new template : `/new`

> [!note]
> The `/new` commands can only add 4 fields to the modals, instead of 5. It's a limitation of discord, as you can only have 25 fields (including optional and mandatory)
> If you need to add one more fields, use the `/add`commands.

The commands needs:
- `title` : The embed title
- `thread_name` : The template for embed title (see [#Default template](#default-template))
- `role` : The role that must be added by the bot when the ticket is created. You can add more using the edit commands.
- `description` : The embeds contents
- `channel` : The channel where the embed will be send AND the ticket will be created.

After, you can choose to create 4 fields. See [#Template and fields definition](#template-and-fields-definition)

## Rename : `/rename`

> [!note]
> Allow to edit the ticket template name.

The command needs:
- The `message_id` of the JSON save (the message that contains the JSON as save for the template)
- `thread_name` : The new template for thread name

## Manage role : `/role`

> [!note]
> Allow to :
> - Add
> - Remove
>
> Roles in the template

The command needs:
- `message_id`
- `action` : `add` or `remove` a role
- `role` : The role to remove or add

## Manage field : `/fields`
### Add : `/fields add`

> [!note]
> Allow to add a field into the template

> [!warning]
> You can't add more than 5 fields onto the template

Needs:
- `message_id`
- `field_id`

You can add each option or just one.

### Edit: `/fields edit`

> [!note]
> Allow to edit a field from the template

Needs:
- `message_id`
- `field_id`

As before, you can edit each option separately.

### Remove : `/fields remove`

> [!note]
> Remove a field from the template

Needs:
- `message_id`
- `field_id`

## Embeds : `/embed`
### Edit : `/embed edit`

> [!note]
> Allow to edit the embed that create the ticket.

The commands must be used in the channel where the embed is. Moreover, the commands needs the `message_id` of the embed.

It allows to edit or add :
- `color` : Accepts a hexadecimal color, a rgb in `(1, 2, 3)` or `[1, 2, 3]` format, or a [color name from the API](https://old.discordjs.dev/#/docs/discord.js/14.14.1/typedef/ColorResolvable).
- `channel` : Allow to move the embed into another channel (beware that it's just a simple move of the embed, you need to have the original, and the original will be deleted thereafter!)
- `description` : Allow to change the embeds contents
- `thumbnail` : Allow to send a image to change the thumbnail of the embed
- `title` : Changing the embed title

### Recreate : `/embed recreate`

Allow to recreate the embed (ie the previous was deleted) from the template. It needs:
- `channel` : The channel where to send the embed and where the thread will be created
- `message_id` : The id or link to the template message JSON
- `title` : The title of the embed
- `description` : The description of the embed

The embed will be send into the new channel.
