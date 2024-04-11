import type Client from "@/structures/client.js";
import eventHandler from "./event-handler.js";
import commandHandler from "./slash-command-handler.js";
export default function initHandlers(client: Client) {
  passClient(client, commandHandler, eventHandler);
}
function passClient(client: Client, ...funcs: ((client: Client) => unknown)[]) {
  for (const func of funcs) func(client);
}
