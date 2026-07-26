import { Clipboard, Detail, Grid } from "@raycast/api";
import { fileURLToPath } from "node:url";
import { useEffect, useState } from "react";

export default function Command() {

  const [clipboardImages, setClipboardImages] = useState<string[]>([])

  useEffect(() => {

    async function loadClipboardImages(){
      const results: string[] = []

      for (let offset = 0; offset < 5; offset++){
        const clipItem = await Clipboard.read({offset})
        if (!clipItem.file){
          continue;
        }
        const path = fileURLToPath(clipItem.file);
        results.push(path)
      }

      setClipboardImages(results)
    }

    loadClipboardImages()

  }, [])

  return (
    <>
      Clipboard Images
      <Grid>
        {clipboardImages.map((image) => (
          <Grid.Item
            key={image}
            title={image}
            content={{ source: image }}
          />
        ))}
      </Grid>
    </>
  );
}