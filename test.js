const projectId = 'avian-foundry-383301';
const zone = 'us-east4-b'

const compute = require('@google-cloud/compute');

// List all instances in the given zone in the specified project.
// async function listInstances() {
//   const instancesClient = new compute.InstancesClient();

//   const [instanceList] = await instancesClient.list({
//     project: projectId,
//     zone,
//   });

//   console.log(`Instances found in zone ${zone}:`);

//   for (const instance of instanceList) {
//     console.log(` - ${instance.name} (${instance.machineType})`);
//   }
// }


// async function getInstanceStatus() {
//     const instancesClient = new compute.InstancesClient();

//     const instanceStatus = await instancesClient.get({
//         project: projectId,
//         zone,
//         instance: 'instance-3',
//     });

//     const instance = instanceStatus[0];
//     const status = instance.status;

//     console.log(`Instance status: ${status}`);
// }


// getInstanceStatus().catch(console.error);

// const settings = require('./settings.json');


async function stopInstance() {
  const instancesClient = new compute.InstancesClient();

  const [response] = await instancesClient.stop({
    project: projectId,
    zone,
    instance: 'instance-3',
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
  }

  console.log('Instance stopped.');
}

stopInstance();