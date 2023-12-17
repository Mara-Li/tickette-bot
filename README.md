# Ticket thread+

Allow to create a template for ticket

Template will be saved in a file (json) and send in a channel. The bot allow to create ticket based on template, when each field_id can be used for the thread name. For example, if you have a field named "name", you can use {{name}} in the thread name. The bot will replace it by the value of the field when the user create the ticket.

You can choose to , also, template the ticket name with the same template, while using the field name in the template. Some value already exists :
- date : date of the day
- time : time of the day
- nickname : nickname of the user (on the server)

Set the field name in {{field_name}} to use it in the template: `{{field_name}} | {{field_name}} | {{field_name}}` is a example of using in the template name.

The template is saved in a json file, send in the channel where you used the command.

At the creation, the template is facultative, and you can use the bot to create simple ticket in a thread.

To use edit the template (using `/config`), you need to have the id of the message where the template was saved. To do that, you need to have the developper mode enabled in Discord (in the settings), and right click on the message, and click on "Copy ID".

The commands can only be used by user that have the "Manage channels" permission.