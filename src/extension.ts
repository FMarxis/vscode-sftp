'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

import * as output from './modules/output';
import { initConfigs, addConfig, configFileName } from './modules/config';
import { invalidRemote, endRemote } from './modules/remoteFs';
import { onFileChange, watchFiles, clearAllWatcher } from './modules/fileWatcher';
import { sync2RemoteCommand, sync2LocalCommand, uploadCommand, downloadCommand } from './commands/sync';
import editConfig from './commands/config';
import autoSave from './commands/auto-save';
import {
  SYNC_TO_REMOTE,
  SYNC_TO_LOCAL,
  UPLOAD,
  DOWNLOAD,
  CONFIG,
} from './constants';

function registerCommand(
  context: vscode.ExtensionContext,
  name: string,
  callback: (args: any[]) => any,
  thisArg?: any
) {
  const disposable = vscode.commands.registerCommand(name, callback, thisArg);
  context.subscriptions.push(disposable);
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  if (!vscode.workspace.rootPath) return;

  output.status.msg('SFTP searching configs...');
  registerCommand(context, CONFIG, editConfig);

  return initConfigs()
    .then(configTrie => {
      registerCommand(context, SYNC_TO_REMOTE, sync2RemoteCommand);

      registerCommand(context, SYNC_TO_LOCAL, sync2LocalCommand);

      registerCommand(context, UPLOAD, uploadCommand);

      registerCommand(context, DOWNLOAD, downloadCommand);

      watchFiles(configTrie.findValueWithShortestBranch());

      const handleDocumentChange = (uri: vscode.Uri) => {
        if (path.basename(uri.fsPath) === configFileName) {

          // make sure to re-conncet
          invalidRemote();
          addConfig(uri.fsPath)
            .then(config => {
              watchFiles(config);
            }, output.onError);
        } else {
          autoSave(uri);
        }
      };

      output.status.msg('SFTP Ready', 1000 * 8);
      onFileChange(handleDocumentChange);
    }, output.onError);
}

export function deactivate() {
  clearAllWatcher();
  endRemote();
}
