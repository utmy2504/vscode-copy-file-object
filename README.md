# Copy Finder File Object

Copy a file from the VS Code Explorer as a macOS Finder file object.

This is useful when you want to paste a file into apps that accept real file attachments, not just a file path.

## Features

- Copy a local file from the Explorer context menu
- Copy the selected Explorer file with `Cmd+Option+C` on macOS
- Fall back to the active editor file when no Explorer item is available
- Optional success notification

## Usage

Right-click a local file in the VS Code Explorer and choose **Copy Finder File Object**.

You can also select a file in the Explorer and press:

```text
Cmd+Option+C
```

Then paste into Finder, Mail, Messages, chat apps, or other macOS apps that accept file objects.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `copyFileObject.showSuccessMessage` | `false` | Show a notification after copying a file object. |

## Requirements

This extension supports macOS only. It uses the macOS `osascript` command to place a Finder-style file object on the clipboard.

Only local `file:` resources are supported.

## Notes

This extension copies a file object, not a text path. If you only need a path, VS Code already has built-in commands such as **Copy Path** and **Copy Relative Path**.

## License

MIT
