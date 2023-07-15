const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const projectId = 'avian-foundry-383301';
const zone = 'us-east4-b'
const instance = 'instance-3'
const compute = require('@google-cloud/compute');
const settings = require('../../settings.json');


module.exports = {
	data: new SlashCommandBuilder()
		.setName("get-mc-server-status")
		.setDescription("Display info about Minecraft server."),

	async execute(interaction) {
		console.log("get-mc-server-status command executed");

		// allows us to take upto 15 minutes to respond
		await interaction.deferReply();
		const instancesClient = new compute.InstancesClient();

		const instanceStatus = await instancesClient.get({
			project: projectId,
			zone,
			instance,
		});

		const instanceInfo = instanceStatus[0];
		const status = instanceInfo.status;
		const extIp = instanceInfo.networkInterfaces[0].accessConfigs[0].natIP;
		const disk = instanceInfo.disks[0].diskSizeGb;
		const cpu = instanceInfo.machineType.split('/')[10];
		

		if(status == 'RUNNING'){
			console.log("Minecraft server is running");
			const embed = new EmbedBuilder()
			.setTitle("Minecraft Server Status- Running")
			.setDescription("The Minecraft server is currently **running**. If you need to stop it run the `/stop-mc-server` command.")
			.setColor(settings.colors.green)
			.addFields
			(
				{ name: "External IP", value: extIp, inline: true },
				{ name: "Internal IP", value: instanceInfo.networkInterfaces[0].networkIP, inline: true },
				{ name: "Status", value: status, inline: true },
				{ name: "Service List", value: "**NerdCraft** - `mc.julianp.xyz:25566`\n**ShakerCentral** - `mc.julianp.xyz`", inline: true },
				{ name: "System Info (CPU, Disk)", value: `${cpu}, ${disk} GB Disk`, inline: true },
			)
			.setTimestamp()
			.setFooter({ text: "Avian Foundry" });

			await interaction.editReply({ embeds: [embed] });
		}
		

		if(status == 'TERMINATED'){
			console.log("Minecraft server is terminated");
			const embed = new EmbedBuilder()
			.setTitle("Minecraft Server Status - Terminated")
			.setDescription("The Minecraft server is currently **terminated**. If you need to start it run the `/start-mc-server` command.")
			.setColor(settings.colors.red)
			.addFields
			(
				{ name: "External IP", value: extIp, inline: true },
				{ name: "Internal IP", value: instanceInfo.networkInterfaces[0].networkIP, inline: true },
				{ name: "Status", value: status, inline: true },
				{ name: "System Info (CPU, Disk)", value: `${cpu}, ${disk} GB Disk`, inline: true },
			)
			.setTimestamp()
			.setFooter({ text: "Avian Foundry" });

			await interaction.editReply({ embeds: [embed] });
		}


		if(status == 'STOPPING'){
			console.log("Minecraft server is stopping");
			const embed = new EmbedBuilder()
			.setTitle("Minecraft Server Status - Stopping")
			.setDescription("The Minecraft server is currently **stopping**. If you need to start it, please wait a minute and try again.")
			.setColor(settings.colors.orange)
			.addFields
			(
				{ name: "External IP", value: extIp, inline: true },
				{ name: "Internal IP", value: instanceInfo.networkInterfaces[0].networkIP, inline: true },
				{ name: "Status", value: status, inline: true },
				{ name: "System Info (CPU, Disk)", value: `${cpu}, ${disk} GB Disk`, inline: true },
			)
			.setTimestamp()
			.setFooter({ text: "Avian Foundry" });

			await interaction.editReply({ embeds: [embed] });
		}

		if(status == 'STAGING'){
			console.log("Minecraft server is staging");
			const embed = new EmbedBuilder()
			.setTitle("Minecraft Server Status - Staging")
			.setDescription("The Minecraft server is currently **starting**. Please wait a minute for it to finish starting.")
			.setColor(settings.colors.orange)
			.addFields
			(
				{ name: "External IP", value: extIp, inline: true },
				{ name: "Internal IP", value: instanceInfo.networkInterfaces[0].networkIP, inline: true },
				{ name: "Status", value: status, inline: true },
				{ name: "System Info (CPU, Disk)", value: `${cpu}, ${disk} GB Disk`, inline: true },
			)
			.setTimestamp()
			.setFooter({ text: "Avian Foundry" });

			await interaction.editReply({ embeds: [embed] });
		}
	},
};
