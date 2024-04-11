import fs from "node:fs/promises";
import type Button from "@/structures/button.js";
import type Client from "@/structures/client.js";
export default async function buttonHandler(client: Client) {
  const directories = await fs.readdir("./src/interactions/Buttons");
  for (const directory of directories) {
    const files = (await fs.readdir(`./src/interactions/Buttons/${directory}/`)).filter(
      v => !v.endsWith(".disabled.ts")
    );
    for (const file of files) {
      const imported = (await import(`../interactions/Buttons/${directory}/${file}`).then(
        imported => imported.default
      )) as Button;
      client.buttons.set(imported.customId, imported);
      client.logger.info(`[BUTTONS] Loaded button ${imported.customId}`);
    }
  }
}
