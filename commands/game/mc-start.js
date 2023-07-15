const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const projectId = 'avian-foundry-383301';
const zone = 'us-east4-b'
const instance = 'instance-3'
const compute = require('@google-cloud/compute');
const settings = require('../../settings.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("start-mc-server")
		.setDescription("Start the Minecraft server."),

	async execute(interaction) {
		console.log("start-mc-server command executed");

		// allows us to take upto 15 minutes to respond
		await interaction.deferReply();
		const instancesClient = new compute.InstancesClient();

		// get the status of the instance
		const instanceStatus = await instancesClient.get({
			project: projectId,
			zone,
			instance,
		});

		const instanceInfo = instanceStatus[0];
		const status = instanceInfo.status;

		if(status == 'RUNNING'){
			console.log("Minecraft server is already running");
			const embed = new EmbedBuilder()
			.setTitle("Minecraft Server Status - Running")
			.setDescription("The Minecraft server is already **running**. If you need to stop it run the `/stop-mc-server` command.")
			.setColor(settings.colors.green)
			.setTimestamp()
			.setFooter({ text: "Avian Foundry" });

			await interaction.editReply({ embeds: [embed] });

		} else if(status == 'STAGING' || status == 'PROVISIONING' || status == 'STARTING'){
			console.log("Minecraft server is starting");
			const embed = new EmbedBuilder()
			.setTitle("Minecraft Server Status - Starting")
			.setDescription("The Minecraft server is currently **starting**. Please wait a few minutes and try again.")
			.setColor(settings.colors.yellow)
			.setTimestamp()
			.setFooter({ text: "Avian Foundry" });

			await interaction.editReply({ embeds: [embed] });

		} else if(status == 'STOPPING'){
			console.log("Minecraft server is stopping");
			const embed = new EmbedBuilder()
			.setTitle("Minecraft Server Status - Stopping")
			.setDescription("The Minecraft server is currently **stopping**. Please wait a few minutes and try again.")
			.setColor(settings.colors.yellow)
			.setTimestamp()
			.setFooter({ text: "Avian Foundry" });

			await interaction.editReply({ embeds: [embed] });

		}


		// if the instance is terminated, start it
		if(status == 'TERMINATED'){
			console.log("Minecraft server is terminated | Starting");
			const [response] = await instancesClient.start({
				project: projectId,
				zone,
				instance: instance,
			});
			let operation = response.latestResponse;
			const operationsClient = new compute.ZoneOperationsClient();

			// Wait for the operation to complete.
			while (operation.status !== 'DONE') {
				[operation] = await operationsClient.wait({
					operation: operation.name,
					project: projectId,
					zone: operation.zone.split('/').pop(),
				});

				console.log("Minecraft server is terminated | Starting | Waiting");
			}

			console.log("Minecraft server is terminated | Starting | Done");
			const embed = new EmbedBuilder()
			.setTitle("Minecraft Server Status - Starting")
			.setDescription("The Minecraft server is currently **starting**. Please wait a few minutes")
			.setColor(settings.colors.yellow)
			.setTimestamp()
			.setFooter({ text: "Avian Foundry" });

			await interaction.editReply({ embeds: [embed] });

		}  
    }
}