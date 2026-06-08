import * as vscode from "vscode";
import { execFile } from "child_process";
import { existsSync } from "fs";
import { isAbsolute } from "path";

function escapeAppleScriptString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function copyFileObjectToClipboard(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const escapedPath = escapeAppleScriptString(filePath);

    const script = `
      set theFile to POSIX file "${escapedPath}"
      set the clipboard to theFile
    `;

    execFile("osascript", ["-e", script], (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
      } else {
        resolve();
      }
    });
  });
}

function shouldShowSuccessMessage(): boolean {
  return vscode.workspace
    .getConfiguration("copyFileObject")
    .get<boolean>("showSuccessMessage", false);
}

async function getCurrentFileUrisFromClipboardCommand(): Promise<vscode.Uri[]> {
  await vscode.commands.executeCommand("copyFilePath");

  const clipboardText = await vscode.env.clipboard.readText();
  const filePaths = clipboardText
    .split(/\r?\n/)
    .map((filePath) => filePath.trim())
    .filter((filePath) => isAbsolute(filePath) && existsSync(filePath));

  return filePaths.map((filePath) => vscode.Uri.file(filePath));
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "copyFileObject.copy",
    async (uri?: vscode.Uri, selectedUris?: vscode.Uri[]) => {
      try {
        if (process.platform !== "darwin") {
          vscode.window.showErrorMessage(
            "Copy File Object currently supports macOS only."
          );
          return;
        }

        let targets =
          selectedUris && selectedUris.length > 0 ? selectedUris : uri ? [uri] : [];

        if (targets.length === 0) {
          targets = await getCurrentFileUrisFromClipboardCommand();
        }

        if (targets.length === 0 && vscode.window.activeTextEditor) {
          targets = [vscode.window.activeTextEditor.document.uri];
        }

        if (targets.length === 0) {
          vscode.window.showErrorMessage("No file selected.");
          return;
        }

        if (targets.length > 1) {
          vscode.window.showErrorMessage(
            "This minimal version supports one file at a time."
          );
          return;
        }

        const target = targets[0];

        if (target.scheme !== "file") {
          vscode.window.showErrorMessage("Only local files are supported.");
          return;
        }

        await copyFileObjectToClipboard(target.fsPath);

        if (shouldShowSuccessMessage()) {
          vscode.window.showInformationMessage(
            `Copied Finder file object: ${target.fsPath}`
          );
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Failed to copy file object: ${message}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
