import fs from "node:fs/promises";
import type Client from "@/structures/client.js";
import type ContextMenu from "@/structures/context-menu.js";
export default async function contextMenuHandler(client: Client) {
  const directories = await fs.readdir("./src/interactions/context-menus");
  for (const directory of directories) {
    const files = (await fs.readdir(`./src/interactions/context-menus/${directory}/`)).filter(
      v => !v.endsWith(".disabled.ts")
    );
    for (const file of files) {
      const imported = (await import(`../interactions/context-menus/${directory}/${file}`).then(
        imported => imported.default
      )) as ContextMenu;
      client.contextMenus.set(imported.data.name, imported);
      client.logger.info(`[CONTEXTMENU] Loaded app ${imported.data.name}`);
    }
  }
}
