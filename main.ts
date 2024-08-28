import { App, Editor, FileView, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, Vault, View, ViewState, WorkspaceLeaf, addIcon, loadMermaid } from 'obsidian';
import { OpenChatModal } from 'src/Modals/OpenChatModal';
import { GeminiChatView, VIEW_TYPE_GEMINI_CHAT } from 'src/Views/GeminiChatView';

interface GeminiPluginSettings {
	Gemini_Api_Key: string;
	DeveloperMode: boolean;
	DefaultSavePath: string;
}

const DEFAULT_SETTINGS: GeminiPluginSettings = {
	Gemini_Api_Key: "",
	DeveloperMode: false,
	DefaultSavePath: "Gemini Chats"
}

export default class GeminiPlugin extends Plugin {
	settings: GeminiPluginSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SettingsTab(this.app, this));

		this.registerView(
			VIEW_TYPE_GEMINI_CHAT,
			(leaf) => {
				return new GeminiChatView(leaf, this.app, this);
			}
		);
		this.registerExtensions(["gemini"], VIEW_TYPE_GEMINI_CHAT);
		this.registerEvent(this.app.workspace.on("file-open", (file) => {
			if (file?.extension == "gemini") {
				this.activateChatView(file);
			}
		}))
		this.addRibbonIcon("sparkles", "New Gemini Chat", () => { this.newChatView() });
		this.addCommand({
			id: 'gemini-new-chat',
			name: 'New Gemini Chat',
			callback: () => { this.newChatView() },
		})
		this.addCommand({
			id: 'gemini-open-chat',
			name: 'Open Gemini Chat',
			callback: () => {
				new OpenChatModal(this.app, (file: TFile) => {
					this.app.workspace.getLeaf(false).openFile(file);
				}).open()
			}
		})

	}

	async onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_GEMINI_CHAT);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}


	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateChatView(file: TFile) {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_GEMINI_CHAT).filter((leaf) => {
			if (leaf.view instanceof FileView) {
				const view = leaf.view as FileView;

				if (view.file == file) {
					return true;
				}
			}
			return false;
		});

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			leaf = workspace.getLeaf(false);
			await leaf.setViewState({ type: VIEW_TYPE_GEMINI_CHAT, active: true });
		}

		if (leaf) {
			workspace.setActiveLeaf(leaf);
		}
	}

	async newChatView() {
		let path = `${this.settings.DefaultSavePath}`;
		if (!path.endsWith("/")) path += "/";
		if (this.settings.DefaultSavePath == "") path = "";

		this.app.vault.adapter.mkdir(path.endsWith('/') ? path.slice(0, -1) : path);
		let name = "New Chat.gemini";

		let index = 0;
		while (this.app.vault.getAbstractFileByPath(path + name) != null) {
			index += 1;
			name = `New Chat ${index}.gemini`;

			if (index >= 100) {
				// Exit condition to avoid infinite loop
				new Notice("Failed to create a new chat");
				return;
			}
		}

		console.log(`new chat: ${path + name}`)
		let file = await this.app.vault.create(path + name, "");
		await this.app.workspace.getLeaf(false).openFile(file);
	}
}

class SettingsTab extends PluginSettingTab {
	plugin: GeminiPlugin;

	constructor(app: App, plugin: GeminiPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Gemini API Key")
			.addText(text => text
				.setPlaceholder("Your API key here")
				.setValue(this.plugin.settings.Gemini_Api_Key)
				.onChange(async (value) => {
					this.plugin.settings.Gemini_Api_Key = value;
					await this.plugin.saveSettings();
				}))

		new Setting(containerEl)
			.setName("Developer mode")
			.setDesc("Fakes the sending of requests, leave this off unless you want fake answers for some reason...")
			.addToggle(value => value
				.setValue(this.plugin.settings.DeveloperMode)
				.onChange(async (value) => {
					this.plugin.settings.DeveloperMode = value;
					await this.plugin.saveSettings();
				}))

		new Setting(containerEl)
			.setName("Default File Path")
			.setDesc("The default folder for saved Gemini Chats. Leave empty to have new chats appear at vault root.")
			.addText(text => text
				.setPlaceholder("Folder path")
				.setValue(this.plugin.settings.DefaultSavePath)
				.onChange(async (value) => {
					this.plugin.settings.DefaultSavePath = value;
					await this.plugin.saveSettings();
				})

			)

	}
}
