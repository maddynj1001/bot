module.exports = {
	name: 'help',
	description: 'Displays help menu',
  usage: 'help [command]',
	execute(message, args, config, version) {
    // command starts here
    message.delete();
    if(config.useEmbeds) {
      const embed = new Discord.RichEmbed()
        .setAuthor(`${client.user.username} / Ticket Log`, client.user.avatarURL)
        .setColor(config.colour)
        .setDescription(":white_check_mark: **Started succesfully**")
        .setFooter(`${client.guilds.get(config.guildID).name} : DiscordTickets by Eartharoid`);
      message.channel.send({embed})
    } else {
      message.channel.send(`**Prefix =** \`${config.prefix}\`\n**Bot Version =** \`${version}\``)
    }


    // command ends here
	},
};
