const { RichEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const { getMember, formatDate } = require("../../functions.js");

module.exports = {
    name: "gracz",
    aliases: ["gracz", "user", "info"],
    description: "Returns user information",
    category: "info",
    usage: "[username | id | mention]",
    run: (client, message, args) => {
        const member = getMember(message, args.join(" "));

        // Member variables
        const joined = formatDate(member.joinedAt);
        const roles = member.roles
            .filter(r => r.id !== message.guild.id)
            .map(r => r).join(", ") || 'none';

        // User variables
        const created = formatDate(member.user.createdAt);

        const embed = new RichEmbed()
            .setFooter(member.displayName, member.user.displayAvatarURL)
            .setThumbnail(member.user.displayAvatarURL)
            .setColor(member.displayHexColor === '#000000' ? '#ffffff' : member.displayHexColor)

            .addField('Informacje o graczu:', stripIndents`**> Nazwa gracza:** ${member.displayName}
            **> Dołączył:** ${joined}
            **> Role:** ${roles}`, true)

            .addField('Informacje Ogólne:', stripIndents`**> ID:** ${member.user.id}
            **> Nick**: ${member.user.username}
            **> Tag**: ${member.user.tag}
            **> Utworzył konto**: ${created}`, true)
            
            .setTimestamp()

        if (member.user.presence.game) 
            embed.addField('Aktualnie gra', stripIndents`**> Nazwa gry:** ${member.user.presence.game.name}`);

        message.channel.send(embed);
    }
}