import { Clipboard, Detail } from "@raycast/api";
import { useEffect, useState } from "react";

export default function Command() {
  const [output, setOutput] = useState("Loading...");

  useEffect(() => {
    async function inspectHistory() {
      const results = [];

      for (let offset = 0; offset < 5; offset++) {
        try {
          const item = await Clipboard.read({ offset });

          results.push({
            offset,
            item,
          });
        } catch (error) {
          results.push({
            offset,
            error: String(error),
          });
        }
      }

      setOutput(`\`\`\`json\n${JSON.stringify(results, null, 2)}\n\`\`\``);
    }

    void inspectHistory();
  }, []);

  return <Detail markdown={output} />;
}