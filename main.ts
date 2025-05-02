const decoder = new TextDecoder();
const encoder = new TextEncoder();
const hosts = new Map<string, string>();

const udpListener = Deno.listenDatagram({
  hostname:"0.0.0.0",
  port: 10000,
  transport: "udp"
});

if (import.meta.main) {
  console.log("Starting...");

  await Promise.all([
    listen(),
    send(1000),
    view(2000)
  ]);
}

async function view(interval: number) {
  while(true){
    for(const address of hosts.keys())
      console.log(`${address}\t${hosts.get(address)}`);

    hosts.clear();
    await delay(interval);
    console.clear();
  }
}

async function listen() : Promise<void> {
  for await (const [data, address] of udpListener)
    hosts.set((address as Deno.NetAddr).hostname, decoder.decode(data));
}

async function send(interval: number) : Promise<void>{
  while(true){
    await udpListener.send(
      encoder.encode(Deno.hostname()), 
      {
        hostname:"255.255.255.255",
        port: 10000,
        transport: "udp",
      }
    );
    await delay(interval);
  }
}

async function delay(ms:number) {
  return await new Promise(resolve => setTimeout(resolve, ms));
}
