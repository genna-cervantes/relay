import { Clipboard, Detail, Grid, ActionPanel, Action, showToast, Toast, getPreferenceValues, showHUD } from "@raycast/api";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { useEffect, useState } from "react";

const execFileAsync = promisify(execFile);

const remoteDirectory = "~/relay/uploads";

async function uploadImage(localPath: string) {
  const { remoteHost } =
    getPreferenceValues<{
      remoteHost: string;
    }>();

  const filename = `clipboard-${Date.now()}.png`;
  const remotePath = `${remoteDirectory}/${filename}`;

  const toast = await showToast({
    style: Toast.Style.Animated,
    title: "Uploading image…",
  });

  try {
    await execFileAsync("/usr/bin/ssh", [
      remoteHost,
      "mkdir",
      "-p",
      remoteDirectory,
    ]);

    await execFileAsync("/usr/bin/scp", [
      localPath,
      `${remoteHost}:${remotePath}`,
    ]);

    await Clipboard.copy(remotePath);

    toast.hide();

    await showHUD("Uploaded — remote path copied");
  } catch (error) {
    console.log(error)

    toast.style = Toast.Style.Failure;
    toast.title = "Upload failed";
    toast.message =
      error instanceof Error ? error.message : String(error);
  }
}

export default function Command() {

  const [clipboardImages, setClipboardImages] = useState<string[]>([])

  useEffect(() => {

    async function loadClipboardImages() {
      const results: string[] = []

      for (let offset = 0; offset < 5; offset++) {
        const clipItem = await Clipboard.read({ offset })
        if (!clipItem.file) {
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
      <Detail markdown='Recent Clipboard Images' />
      <Grid>
        {clipboardImages.map((image, idx) => (
          <Grid.Item
            key={image}
            title={`image-${idx}`}
            content={{ source: image }}
            actions={<ActionPanel>
              <Action
                title="Select Image"
                onAction={() => uploadImage(image)}
              />
            </ActionPanel>
            }
          />
        ))}
      </Grid>
    </>
  );
}