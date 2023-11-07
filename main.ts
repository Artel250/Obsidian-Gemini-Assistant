import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { ChatModal } from "components/ChatModal";
import { Bard } from 'components/BardConnection';

interface TalkToBardSettings {
	Bard_Token: string;
	Bard_Token_2: string;
	Bard_Token_3: string;
}

const DEFAULT_SETTINGS: TalkToBardSettings = {
	Bard_Token: '',
	Bard_Token_2: "",
	Bard_Token_3: ""
}

export default class BardPlugin extends Plugin {
	settings: TalkToBardSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new SettingsTab(this.app, this));

		this.addCommand({
			id: "open-chat",
			name: "Chat with Bard",
			callback: () => {
				new ChatModal(this.app, this).open();
			}
		})
		this.addCommand({
			id: "debug",
			name: "Testtttt",
			callback: () => {
				Bard.getBard(this.settings.Bard_Token, this.settings.Bard_Token_2, this.settings.Bard_Token_3).then((result) => {
					result?.getConversation("c_7815b5d52918ecff").then(result => console.log(result));
				})
			}
		})
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

		let optionalTokensHeader = containerEl.createEl("p", { text: "Enter these cookie values if the __Secure-1PSID token does not work" });
		new Setting(optionalTokensHeader)
			.setName("__Secure-1PSIDCC")
			.addText(text => text
				.setPlaceholder("Your token here")
				.setValue(this.plugin.settings.Bard_Token_2)
				.onChange(async (value) => {
					this.plugin.settings.Bard_Token_2 = value;
					await this.plugin.saveSettings();
				}))
		new Setting(optionalTokensHeader)
			.setName("__Secure-1PSIDTS")
			.addText(text => text
				.setPlaceholder("Your token here")
				.setValue(this.plugin.settings.Bard_Token_3)
				.onChange(async (value) => {
					this.plugin.settings.Bard_Token_3 = value;
					await this.plugin.saveSettings();
				}))
	}
}
