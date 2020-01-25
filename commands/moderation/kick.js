const { RichEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const { promptMessage } = require("../../functions.js");

module.exports = {
    name: "kick",
    category: "moderation",
    description: "Kicks the member",
    usage: "<id | mention>",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.find(c => c.name === "logs") || message.channel;

        if (message.deletable) message.delete();

        // No args
        if (!args[0]) {
            return message.reply("Należy podać osobę, która ma zostać wyrzucona.")
                .then(m => m.delete(5000));
        }

        // No reason
        if (!args[1]) {
            return message.reply("Należy podać powód wyrzucenia.")
                .then(m => m.delete(5000));
        }

        // No author permissions
        if (!message.member.hasPermission("KICK_MEMBERS")) {
            return message.reply("❌ Nie masz uprawnień do wyrzucania graczy")
                .then(m => m.delete(5000));
        }

        // No bot permissions
        if (!message.guild.me.hasPermission("KICK_MEMBERS")) {
            return message.reply("❌ Nie mam uprawnień do wyrzucania graczy.")
                .then(m => m.delete(5000));
        }

        const toKick = message.mentions.members.first() || message.guild.members.get(args[0]);

        // No member found
        if (!toKick) {
            return message.reply("Nie można znaleźć takiego gracza.")
                .then(m => m.delete(5000));
        }

        // Can't kick urself
        if (toKick.id === message.author.id) {
            return message.reply("Nie możesz wyrzucić samego siebie...")
                .then(m => m.delete(5000));
        }

        // Check if the user's kickable
        if (!toKick.kickable) {
            return message.reply("Nie mogę wyrzucić tej osoby. (możliwe, że ma wyższą rolę ode mnie).")
                .then(m => m.delete(5000));
        }
                
        const embed = new RichEmbed()
            .setColor("#ff0000")
            .setThumbnail(toKick.user.displayAvatarURL)
            .setFooter(message.member.displayName, message.author.displayAvatarURL)
            .setTimestamp()
            .setDescription(stripIndents`**> Wyrzucony gracz:** ${toKick} (${toKick.id})
            **> Wyrzucony Przez:** ${message.member} (${message.member.id})
            **> Powód:** ${args.slice(1).join(" ")}`);

        const promptEmbed = new RichEmbed()
            .setColor("GREEN")
            .setAuthor(`Głosowanie to będzie nieważne za 30s.`)
            .setDescription(`Czy jesteś pewien aby wyrzucić ${toKick}?`)

        // Send the message
        await message.channel.send(promptEmbed).then(async msg => {
            // Await the reactions and the reaction collector
            const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

            // The verification stuffs
            if (emoji === "✅") {
                msg.delete();

                toKick.kick(args.slice(1).join(" "))
                    .catch(err => {
                        if (err) return message.channel.send(`Więc.... wyrzucenie nie zadziałało tutaj jest error ${err}`)
                    });

                logChannel.send(embed);
            } else if (emoji === "❌") {
                msg.delete();

                message.reply(`Wyrzucenie anulowane.`)
                    .then(m => m.delete(10000));
            }
        });
    }
};