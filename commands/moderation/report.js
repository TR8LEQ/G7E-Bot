const { RichEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "report",
    category: "moderation",
    description: "Reports a member",
    usage: "<mention, id>",
    run: async (client, message, args) => {
        // If the bot can delete the message, do so
        if (message.deletable) message.delete();

        // Either a mention or ID
        let rMember = message.mentions.members.first() || message.guild.members.get(args[0]);

        // No person found
        if (!rMember)
            return message.reply("Nie mogę znaleźć takiego gracza?").then(m => m.delete(5000));

        // The member has BAN_MEMBERS or is a bot
        if (rMember.hasPermission("BAN_MEMBERS") || rMember.user.bot)
            return message.channel.send("Nie mogę zgłosić tego gracza.").then(m => m.delete(5000));

        // If there's no argument
        if (!args[1])
            return message.channel.send("Proszę podać powód zgłoszenia.").then(m => m.delete(5000));
        
        const channel = message.guild.channels.find(c => c.name === "reports")
            
        // No channel found
        if (!channel)
            return message.channel.send("Nie znaleziono kanału `#reports` (jest wymagany)").then(m => m.delete(5000));

        const embed = new RichEmbed()
            .setColor("#ff0000")
            .setTimestamp()
            .setFooter(message.guild.name, message.guild.iconURL)
            .setAuthor("Zgłoszony gracz", rMember.user.displayAvatarURL)
            .setDescription(stripIndents`**> Gracz:** ${rMember} (${rMember.user.id})
            **> Zgłoszony Przez:** ${message.member}
            **> Zgłoszony na:** ${message.channel}
            **> Powód:** ${args.slice(1).join(" ")}`);

        return channel.send(embed);
    }
}