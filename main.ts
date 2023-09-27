import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { ChatModal } from "components/ChatModal";
import { Bard } from 'components/BardConnection';



// Remember to rename these classes and interfaces!

interface TalkToBardSettings {
	Bard_Token: string;
}

const DEFAULT_SETTINGS: TalkToBardSettings = {
	Bard_Token: 'default'
}

export default class BardPlugin extends Plugin {
	settings: TalkToBardSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingsTab(this.app, this));

		this.addCommand({
			id: "Open-Chat-Modal-Command",
			name: "Chat with Bard",
			callback: () => {
				new ChatModal(this.app, this).open();
			}
		})
		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
class SettingsTab extends PluginSettingTab {
	plugin: BardPlugin;

	constructor(app: App, plugin: BardPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('__Secure-1PSID')
			.setDesc('Enter your __Secure-1PSID token here')
			.addText(text => text
				.setPlaceholder('Your token here')
				.setValue(this.plugin.settings.Bard_Token)
				.onChange(async (value) => {
					this.plugin.settings.Bard_Token = value;
					await this.plugin.saveSettings();
				}));
	}
}
