# Tickette - Discord Ticket Bot

-> [Invite the bot](https://discord.com/api/oauth2/authorize?client_id=1186067111760629812&permissions=395137248256&scope=bot+applications.commands)

## Overview

Tickette is a Discord bot that creates customizable ticket systems using threads. When users click on a ticket button, a modal opens where they can fill in information you've configured. This information is then used to generate the ticket thread name and determine who gets access.

**Key Features:**
- **No Database Required** - All templates are stored as JSON files in your Discord server for maximum security
- **Thread-Based Tickets** - Easy management with Discord's native thread features (archive, add users, delete)
- **Customizable Fields** - Create modal forms with various input types
- **Dynamic Thread Names** - Use templates with variables that get replaced by user input

> [!important]
> Commands can only be used by users with the `Manage Channels` permission.

---

# Understanding Templates and Fields

## What is a Template?

A **template** is a blueprint for creating tickets. Each template contains:
- **Thread Name Template** - Pattern for naming the ticket thread (e.g., `{{type}} | {{nickname}}`)
- **Role(s)** - Role(s) automatically added to the ticket thread
- **Optional Fields** - Custom form fields shown in the modal

## What are Fields?

**Fields** are the input elements shown in the modal when a user opens a ticket. They allow you to collect information that can be used in the thread name.

### Field Properties

Each field has the following properties:

| Property | Required | Description | Example |
|----------|----------|-------------|---------|
| `id` | ✅ Yes | Unique identifier used as a variable in thread names (e.g., `{{id}}`) | `type`, `issue`, `username` |
| `name` | ✅ Yes | The question or label shown to the user (max 45 characters) | "What is your problem?" |
| `description` | ❌ No | Placeholder text or additional context | "Describe your issue briefly" |
| `required` | ❌ No | Whether the field must be filled (default: `false`) | `true` or `false` |
| `type` | ❌ No | Input type (default: `short`) | See types below |

### Field Types

| Type | Description | Max Length |
|------|-------------|------------|
| `short` | Single-line text input | 100 characters |
| `paragraph` | Multi-line text input | 4000 characters |
| `user` | User selector | N/A |
| `role` | Role selector | N/A |
| `mentionable` | User or role selector | N/A |
| `channel` | Channel selector | N/A |

### Example

If you create a field with:
- **id**: `problem_type`
- **name**: "What type of issue?"
- **type**: `short`
- **required**: `true`
- **placeholder**: "e.g., Technical, Billing, General"

And set the thread name template to: `{{problem_type}} - {{nickname}}`

When a user fills in "Technical Support" and their nickname is "John", the thread will be named: **"Technical Support - John"**

## Built-in Template Variables

You can use these pre-defined variables in your thread name template without creating fields:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{nickname}}` | User's global Discord display name | "JohnDoe123" |
| `{{username}}` | User's Discord username (without @) | "johndoe" |
| `{{display}}` | Server nickname (if set) or global name | "Johnny" or "JohnDoe123" |
| `{{user_id}}` | User's Discord ID (snowflake) | "123456789012345678" |
| `{{date}}` | Current date | "2025-10-10" |
| `{{time}}` | Current time (24h format) | "14:30" |

---

# Commands Guide

## Important Notes

- **Template Storage**: Templates are saved as JSON files pinned in the channel where you run the command
- **Message ID**: Many commands require the `message_id` of the template's JSON file. Enable Developer Mode in Discord, right-click the message, and select "Copy Message ID"
- **Message Link**: You can also use a Discord message link instead of just the ID
- **Channel Context**: If using only the message ID (not a link), run the command in the same channel as the template

---

## `/new` - Create a New Template

Creates a new ticket template with an embedded message and button.

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `title` | Text | The title shown on the embed |
| `thread_name` | Text | Template for thread names (use variables like `{{nickname}}`) |
| `role` | Role | Role to add to ticket threads (more can be added later) |
| `description` | Text | The message content in the embed |
| `channel` | Channel | Where the ticket button will be posted and threads created |

### Optional Parameters

You can add up to **4 custom fields** when creating a template:
- `field_1_id`, `field_1_name`, `field_1_description`, `field_1_type`, `field_1_required`
- `field_2_id`, `field_2_name`, etc.
- (up to `field_4_...`)

> [!note]
> Due to Discord's slash command limitations (25 options max), `/new` can only add 4 fields. Use `/fields add` to add a 5th field if needed.

### Example Usage

```
/new
  title: "Report a Bug"
  thread_name: "🐛 {{bug_type}} | {{nickname}}"
  role: @Support Team
  description: "Click the button below to report a bug"
  channel: #bug-reports
  field_1_id: bug_type
  field_1_name: "Type of bug"
  field_1_type: short
  field_1_required: true
```

---

## `/rename` - Change Thread Name Template

Updates the thread name template for an existing ticket configuration.

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `message_id` | ✅ Yes | ID or link of the template JSON message |
| `thread_name` | ✅ Yes | New thread name template |

### Example Usage

```
/rename
  message_id: 1234567890
  thread_name: "[{{date}}] {{type}} - {{display}}"
```

---

## `/role` - Manage Roles

Add or remove roles from a template.

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `message_id` | ✅ Yes | ID or link of the template JSON message |
| `action` | ✅ Yes | Choose `add` or `remove` |
| `role` | ✅ Yes | The role to add or remove |

### Example Usage

```
/role
  message_id: 1234567890
  action: add
  role: @Moderators
```

---

## `/fields` - Manage Fields

### `/fields add` - Add a Field

Adds a new field to the template modal.

> [!warning]
> Maximum 5 fields per template due to Discord's modal limitations.

#### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `message_id` | ✅ Yes | ID or link of the template JSON message |
| `field_id` | ✅ Yes | Unique identifier for the field |
| `field_name` | ❌ No | Question/label text |
| `field_description` | ❌ No | Placeholder or description |
| `field_type` | ❌ No | Input type (default: `short`) |
| `field_required` | ❌ No | Whether required (default: `false`) |

#### Example Usage

```
/fields add
  message_id: 1234567890
  field_id: priority
  field_name: "Priority Level"
  field_description: "How urgent is this issue?"
  field_type: short
  field_required: true
```

---

### `/fields edit` - Edit a Field

Modifies an existing field. You can update any property individually.

#### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `message_id` | ✅ Yes | ID or link of the template JSON message |
| `field_id` | ✅ Yes | ID of the field to edit |
| `field_name` | ❌ No | New question/label text |
| `field_description` | ❌ No | New placeholder or description |
| `field_type` | ❌ No | New input type |
| `field_required` | ❌ No | New required status |

#### Example Usage

```
/fields edit
  message_id: 1234567890
  field_id: priority
  field_required: false
```

---

### `/fields remove` - Remove a Field

Deletes a field from the template.

#### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `message_id` | ✅ Yes | ID or link of the template JSON message |
| `field_id` | ✅ Yes | ID of the field to remove |

#### Example Usage

```
/fields remove
  message_id: 1234567890
  field_id: priority
```

---

## `/embed` - Manage Embed Appearance

### `/embed edit` - Edit the Embed

Modifies the appearance of the ticket button embed.

> [!important]
> This command must be used in the channel where the embed is located.

#### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `message_id` | ✅ Yes | ID or link of the **embed message** (not the JSON template) |
| `title` | ❌ No | New embed title |
| `description` | ❌ No | New embed content |
| `color` | ❌ No | Hex code (`#FF5733`), RGB (`(255, 87, 51)`), or color name (`Red`) |
| `thumbnail` | ❌ No | Image attachment for the embed thumbnail |
| `channel` | ❌ No | Move the embed to a different channel |

> [!note]
> When moving to another channel, the original embed is deleted and recreated in the new location.

#### Example Usage

```
/embed edit
  message_id: 9876543210
  color: #00FF00
  title: "🎫 Open a Support Ticket"
```

---

### `/embed recreate` - Recreate a Deleted Embed

Recreates the ticket button embed if it was accidentally deleted.

#### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `channel` | ✅ Yes | Channel where to create the embed |
| `message_id` | ✅ Yes | ID or link of the template JSON message |
| `title` | ✅ Yes | Embed title |
| `description` | ✅ Yes | Embed content |

#### Example Usage

```
/embed recreate
  channel: #tickets
  message_id: 1234567890
  title: "Support Tickets"
  description: "Click below to open a ticket"
```

---

## Need Help?

If you encounter issues or have questions:
1. Check that you have the `Manage Channels` permission
2. Verify you're using the correct message ID
3. Ensure Developer Mode is enabled in Discord settings
4. Make sure the bot has appropriate permissions in the channels

The footer of each embed contains the `channel_id` and `message_id` for reference.
