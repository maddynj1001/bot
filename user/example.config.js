/**
 * ###############################################################################################
 *  ____                                        _     _____              _             _
 * |  _ \  (_)  ___    ___    ___    _ __    __| |   |_   _| (_)   ___  | | __   ___  | |_   ___
 * | | | | | | / __|  / __|  / _ \  | '__|  / _` |     | |   | |  / __| | |/ /  / _ \ | __| / __|
 * | |_| | | | \__ \ | (__  | (_) | | |    | (_| |     | |   | | | (__  |   <  |  __/ | |_  \__ \
 * |____/  |_| |___/  \___|  \___/  |_|     \__,_|     |_|   |_|  \___| |_|\_\  \___|  \__| |___/
 *
 * ---------------------
 *       Support
 * ---------------------
 *
 * 	> Documentation: https://discordtickets.app
 * 	> Discord support server: https://go.eartharoid.me/discord
 *
 * ###############################################################################################
 */

const prefix = '-';

module.exports = {
	debug: false,
	defaults: {
		colour: '#009999', // https://discord.js.org/#/docs/main/stable/typedef/ColorResolvable
		command_prefix: prefix,
		log_messages: true, // transcripts/archives will be empty if false
		name_format: 'ticket-{number}',
		opening_message: 'Hello {name}, thank you for creating a ticket. A member of staff will soon be available to assist you.\n\n__All messages in this channel are stored for future reference.__',
	},
	locale: 'en-GB', // used for globals (such as commands) and the default guild locale
	logs: {
		enabled: true,
		keep_for: 30,
		split: true,
	},
	max_listeners: 10,
	plugins: [],
	presence: {
		presences: [
			{
				activity: `${prefix}new`,
				type: 'PLAYING'
			},
			{
				activity: 'with tickets',
				type: 'PLAYING'
			},
			{
				activity: 'for new tickets',
				type: 'WATCHING'
			},
			/* { // an example
				activity: 'Minecraft',
				type: 'STREAMING',
				status: 'dnd',
				url: 'https://www.twitch.tv/twitch'
			}, */
		],
		randomise: true,
		duration: 60
	},
	super_secret_setting: true,
	update_notice: true,
};