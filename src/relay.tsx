import { Clipboard, Detail, Grid, ActionPanel, Action, showToast, Toast, getPreferenceValues } from "@raycast/api";
import { execFile } from "node:child_process";
import { basename } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { useEffect, useState } from "react";

const execFileAsync = promisify(execFile);

const remoteDirectory = "/home/relay/uploads";

async function uploadImage(localPath: string) {
  const { remoteHost } =
    getPreferenceValues<{
      remoteHost: string;
    }>();

  const filename = basename(localPath);
  const remotePath = `${remoteDirectory}/${filename}`;

  const toast = await showToast({
    style: Toast.Style.Animated,
    title: "Uploading image…",
  });

  try {
    await execFileAsync("/usr/bin/scp", [
      localPath,
      `${remoteHost}:${remotePath}`,
    ]);

    await Clipboard.copy(remotePath);

    toast.style = Toast.Style.Success;
    toast.title = "Image uploaded";
    toast.message = "Remote path copied";
  } catch (error) {
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