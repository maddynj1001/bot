// eslint-disable-next-line no-unused-vars
const { Collection, Client, Message, MessageEmbed } = require('discord.js');

const fs = require('fs');
const { path } = require('../../utils/fs');

/**
 * Manages the loading and execution of commands
 */
module.exports = class CommandManager {
	/**
	 * Create a CommandManager instance
	 * @param {Client} client 
	 */
	constructor(client) {
		/** The Discord Client */
		this.client = client;

		/** A discord.js Collection (Map) of loaded commands */
		this.commands = new Collection();
	}

	/** Automatically load all internal commands */
	load() {
		const files = fs.readdirSync(path('./src/commands'))
			.filter(file => file.endsWith('.js'));

		for (let file of files) {
			try {
				file = require(`../../commands/${file}`);
				new file(this.client);
			} catch (e) {
				this.client.log.warn('An error occurred whilst loading an internal command');
				this.client.log.error(e);
			}
		}
	}

	/** Register a command */
	register(cmd) {
		const exists = this.commands.has(cmd.name);
		const is_internal = (exists && cmd.internal) || (exists && this.commands.get(cmd.name).internal);

		if (is_internal) {
			let plugin = this.client.plugins.plugins.find(p => p.commands.includes(cmd.name));
			if (plugin)
				this.client.log.commands(`The "${plugin.name}" plugin has overridden the internal "${cmd.name}" command`);
			else
				this.client.log.commands(`An unknown plugin has overridden the internal "${cmd.name}" command`);	
			if(cmd.internal) return;
		}
		else if (exists)
			throw new Error(`A non-internal command with the name "${cmd.name}" already exists`);
		
		this.commands.set(cmd.name, cmd);
		this.client.log.commands(`Loaded "${cmd.name}" command`);
	}

	/**
	 * Execute a command
	 * @param {Message} message - Command message
	 */
	async handle(message) {
		let settings = await message.guild.settings;
		const i18n = this.client.i18n.getLocale(settings.locale);

		let is_blacklisted = false;
		if (settings.blacklist.includes(message.author.id)) {
			is_blacklisted = true;
			this.client.log.info(`Ignoring blacklisted member ${message.author.tag}`);
		} else {
			settings.blacklist.forEach(element => {
				if (message.guild.roles.cache.has(element) && message.member.roles.cache.has(element)) {
					is_blacklisted = true;
					this.client.log.info(`Ignoring member ${message.author.tag} with blacklisted role`);
				}
			});
		}

		if (is_blacklisted) {
			try {
				return message.react('❌');
			} catch (error) {
				return this.client.log.warn('Failed to react to a message');
			}
		}

		const prefix = settings.command_prefix;
		const escaped_prefix = prefix.toLowerCase().replace(/(?=\W)/g, '\\'); // (lazy) escape every character so it can be used in a RexExp
		const client_mention = `<@!?${this.client.user.id}>`;

		let cmd_name = message.content.match(new RegExp(`^(${escaped_prefix}|${client_mention}\\s?)(\\S+)`, 'mi')); // capture prefix and command
		if (!cmd_name) return; // stop here if the message is not a command

		let raw_args = message.content.replace(cmd_name[0], '').trim(); // remove the prefix and command
		cmd_name = cmd_name[2].toLowerCase(); // set cmd_name to the actual command alias, effectively removing the prefix

		const cmd = this.commands.find(cmd => cmd.aliases.includes(cmd_name));
		if (!cmd) return;

		let args = raw_args;

		if (cmd.process_args) {
			args = {};
			let data = [...raw_args.matchAll(/(?<key>\w+)\??\s?:\s?(?<value>([^;]|;{2})*);/gmi)]; // an array of argument objects
			data.forEach(arg => args[arg.groups.key] = arg.groups.value.replace(/;{2}/gm, ';')); // put the data into a useful format
			for (let arg of cmd.args) {
				if (arg.required && !args[arg]) {
					return await cmd.sendUsage(message.channel, cmd_name); // send usage if any required arg is missing
				}
			}
		} else {
			const args_num = raw_args.split(' ').filter(arg => arg.length !== 0).length; // count the number of single-word args were given
			const required_args = cmd.args.reduce((acc, arg) => arg.required ? acc + 1 : acc, 0); // count how many of the args are required
			if (args_num < required_args) {
				return await cmd.sendUsage(message.channel, cmd_name);
			}
		}

		const missing_perms = cmd.permissions instanceof Array && !message.member.hasPermission(cmd.permissions);
		if (missing_perms) {
			let perms = cmd.permissions.map(p => `\`${p}\``).join(', ');
			return await message.channel.send(
				new MessageEmbed()
					.setColor(settings.error_colour)
					.setTitle(i18n('missing_perms.title'))
					.setDescription(i18n('missing_perms.description', perms))
			);
		}

		if (cmd.staff_only && await message.member.isStaff() === false) {
			return await message.channel.send(
				new MessageEmbed()
					.setColor(settings.error_colour)
					.setTitle(i18n('staff_only.title'))
					.setDescription(i18n('staff_only.description'))
			);
		}
			
		try {
			this.client.log.commands(`Executing "${cmd.name}" command (invoked by ${message.author.tag})`);
			await cmd.execute(message, args); // execute the command 
		} catch (e) {
			this.client.log.warn(`An error occurred whilst executing the ${cmd.name} command`);
			this.client.log.error(e);
			await message.channel.send(
				new MessageEmbed()
					.setColor('ORANGE')
					.setTitle(i18n('command_execution_error.title'))
					.setDescription(i18n('command_execution_error.description'))
			); // hopefully no user will ever see this message
		}
	}

};