const { RichEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const { promptMessage } = require("../../functions.js");

module.exports = {
    name: "ban",
    category: "moderation",
    description: "bans the member",
    usage: "<id | mention>",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.find(c => c.name === "logs") || message.channel;

        if (message.deletable) message.delete();

        // No args
        if (!args[0]) {
            return message.reply("Należy podać osobę, która ma zostać zbanowana.")
                .then(m => m.delete(5000));
        }

        // No reason
        if (!args[1]) {
            return message.reply("Należy podać powód zbanowania.")
                .then(m => m.delete(5000));
        }

        // No author permissions
        if (!message.member.hasPermission("BAN_MEMBERS")) {
            return message.reply("❌ Nie masz uprawnień do banowania graczy.")
                .then(m => m.delete(5000));
        
        }
        // No bot permissions
        if (!message.guild.me.hasPermission("BAN_MEMBERS")) {
            return message.reply("❌ Nie mam uprawnień do banowania graczy.")
                .then(m => m.delete(5000));
        }

        const toBan = message.mentions.members.first() || message.guild.members.get(args[0]);

        // No member found
        if (!toBan) {
            return message.reply("Nie można znaleźć takiego gracza.")
                .then(m => m.delete(5000));
        }

        // Can't ban urself
        if (toBan.id === message.author.id) {
            return message.reply("Nie możesz zbanować samego siebie...")
                .then(m => m.delete(5000));
        }

        // Check if the user's banable
        if (!toBan.bannable) {
            return message.reply("Nie mogę zbanować tej osoby. (ma wyższą rolę ode mnie)")
                .then(m => m.delete(5000));
        }
        
        const embed = new RichEmbed()
            .setColor("#ff0000")
            .setThumbnail(toBan.user.displayAvatarURL)
            .setFooter(message.member.displayName, message.author.displayAvatarURL)
            .setTimestamp()
            .setDescription(stripIndents`**> Zbanowany gracz:** ${toBan} (${toBan.id})
            **> Ban Przez:** ${message.member} (${message.member.id})
            **> Powód:** ${args.slice(1).join(" ")}`);

        const promptEmbed = new RichEmbed()
            .setColor("GREEN")
            .setAuthor(`Głosowanie to będzie nieważne za 30s.`)
            .setDescription(`Czy jesteś pewien aby zbanować ${toBan}?`)

        // Send the message
        await message.channel.send(promptEmbed).then(async msg => {
            // Await the reactions and the reactioncollector
            const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

            // Verification stuffs
            if (emoji === "✅") {
                msg.delete();

                toBan.ban(args.slice(1).join(" "))
                    .catch(err => {
                        if (err) return message.channel.send(`Więc.... ban nie zadziałał tutaj jest error ${err}`)
                    });

                logChannel.send(embed);
            } else if (emoji === "❌") {
                msg.delete();

                message.reply(`ban anulowany.`)
                    .then(m => m.delete(10000));
            }
        });
    }
};