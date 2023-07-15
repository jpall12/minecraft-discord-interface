const {
	SlashCommandBuilder,
	EmbedBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	ActionRowBuilder,
} = require("discord.js");

const projectId = "avian-foundry-383301";
const zone = "us-east4-b";
const instance = "instance-3";
const compute = require("@google-cloud/compute");
const settings = require("../../settings.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("stop-mc-server")
		.setDescription("Stop the Minecraft server."),

	async execute(interaction) {
		console.log("stop-mc-server command executed");

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

		// if the instance is already stopped

		if (status === "TERMINATED") {
			const embed = new EmbedBuilder()
				.setTitle("Minecraft Server Status - Terminated")
				.setDescription(
					"The Minecraft server is currently **terminated**. If you need to start it run the `/start-mc-server` command."
				)
				.setColor(settings.colors.red)
				.setTimestamp()
				.setFooter({ text: "Avian Foundry" });

			await interaction.editReply({ embeds: [embed] });
			return;
		} else if (status === "STOPPING") {
			const embed = new EmbedBuilder()
				.setTitle("Minecraft Server Status - Stopping")
				.setDescription(
					"The Minecraft server is currently **stopping**. Please wait for it to stop before trying to stop it again."
				)
				.setColor(settings.colors.red)
				.setTimestamp()
				.setFooter({ text: "Avian Foundry" });

			await interaction.editReply({ embeds: [embed] });
		} else if (status === "PROVISIONING") {
			const embed = new EmbedBuilder()
				.setTitle("Minecraft Server Status - Provisioning")
				.setDescription(
					"The Minecraft server is currently **provisioning**. Please wait for it to finish provisioning before trying to stop it again."
				)
				.setColor(settings.colors.red)
				.setTimestamp()
				.setFooter({ text: "Avian Foundry" });

			await interaction.editReply({ embeds: [embed] });
		} else if (status === "STAGING") {
			const embed = new EmbedBuilder()
				.setTitle("Minecraft Server Status - Staging")
				.setDescription(
					"The Minecraft server is currently **staging**. Please wait for it to finish staging before trying to stop it again."
				)
				.setColor(settings.colors.red)
				.setTimestamp()
				.setFooter({ text: "Avian Foundry" });

			await interaction.editReply({ embeds: [embed] });
		}

		await interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setTitle("Minecraft Server Status - Unknown")
					.setDescription(
						"The Minecraft server is currently in an **unknown** state. Please wait for it to finish before trying to stop it again."
					)
					.setColor(settings.colors.red)
					.setTimestamp()
					.setFooter({ text: "Avian Foundry" }),
			],
		});

		// check if user really wants to stop the server
		const embed = new EmbedBuilder()
			.setTitle("Are you sure?")
			.setDescription(
				"Are you sure you want to stop the Minecraft server? This will **terminate** the server."
			)
			.setColor(settings.colors.red)
			.setTimestamp()
			.setFooter({ text: "Avian Foundry" });

		// create a selection menu
		const selection = new StringSelectMenuBuilder()
			.setCustomId("confirm")
			.setPlaceholder("Select an option")
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel("Confirm")
					.setValue("confirm")
					.setDescription("Confirm stopping the server."),
				new StringSelectMenuOptionBuilder()
					.setLabel("Cancel")
					.setValue("cancel")
					.setDescription("Cancel stopping the server.")
			);

		// create a row with the selection menu
		const row = new ActionRowBuilder().addComponents(selection);

		// send the embed and selection menu
		const response = await interaction.editReply({
			embeds: [embed],
			components: [row],
		});

		// wait for user to select an option
		const filter = (i) =>
			i.customId === "confirm" && i.user.id === interaction.user.id;

		// wait for user to confirm timeout after 20 seconds
		let confirmation;
		try {
			confirmation = await response.awaitMessageComponent({
				filter,
				time: 20000,
			});
		} catch (error) {
			// if user doesn't respond in time
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle("Timed out")
						.setDescription("You took too long to respond.")
						.setColor(settings.colors.red)
						.setTimestamp()
						.setFooter({ text: "Avian Foundry" }),
				],
				components: [],
			});
			return;
		}

		// if user cancels
		if (confirmation.values[0] === "cancel") {
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle("Cancelled")
						.setDescription("Cancelled stopping the Minecraft server.")
						.setColor(settings.colors.red)
						.setTimestamp()
						.setFooter({ text: "Avian Foundry" }),
				],
				components: [],
			});
			return;
		}

		// if user confirms
		if (confirmation.values[0] === "confirm") {
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle("Stopping server...")
						.setDescription(
							"Stopping the Minecraft server. This may take a few minutes. Use `/mc-status` to check the status."
						)
						.setColor(settings.colors.green)
						.setTimestamp()
						.setFooter({ text: "Avian Foundry" }),
				],
				components: [],
			});
			await stopInstance();
			return;
		}

		// stop the instance
		async function stopInstance() {
			const [response] = await instancesClient.stop({
				project: projectId,
				zone,
				instance,
			});
			let operation = response.latestResponse;
			const operationsClient = new compute.ZoneOperationsClient();

			// Wait for the operation to complete.
			while (operation.status !== "DONE") {
				[operation] = await operationsClient.wait({
					operation: operation.name,
					project: projectId,
					zone: operation.zone.split("/").pop(),
				});
			}
			console.log(`Instance ${instance} has been stopped.`);
		}
	},
};
