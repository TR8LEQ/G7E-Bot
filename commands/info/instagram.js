const { RichEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

const fetch = require("node-fetch");

module.exports = {
    name: "instagram",
    aliases: ["insta"],
    category: "info",
    description: "Find out some nice instagram statistics",
    usage: "<name>",
    run: async (client, message, args) => {
        const name = args.join(" ");

        if (!name) {
            return message.reply("Może warto kogoś poszukać...!")
                .then(m => m.delete(5000));
        }

        const url = `https://instagram.com/${name}/?__a=1`;
        
        let res; 

        try {
            res = await fetch(url).then(url => url.json());
        } catch (e) {
            return message.reply("Nie mogę znaleźć takiego konta... :(")
                .then(m => m.delete(5000));
        }

        const account = res.graphql.user;

        const embed = new RichEmbed()
            .setColor("RANDOM")
            .setTitle(account.full_name)
            .setURL(`https://instagram.com/${name}`)
            .setThumbnail(account.profile_pic_url_hd)
            .addField("Informacje Profilowe", stripIndents`**- Nick:** ${account.username}
            **- Pełna Nazwa:** ${account.full_name}
            **- Biografia:** ${account.biography.length == 0 ? "none" : account.biography}
            **- Posty:** ${account.edge_owner_to_timeline_media.count}
            **- Obserwujący:** ${account.edge_followed_by.count}
            **- Obserwuje:** ${account.edge_follow.count}
            **- Konto Prywatne:** ${account.is_private ? "Tak 🔐" : "Nie 🔓"}`);

        message.channel.send(embed);
    }
}