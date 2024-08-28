import GeminiPlugin from 'main';
import { WorkspaceLeaf, TFile, App, FileView, IconName } from 'obsidian';
import { ChatComponent } from '../Components/ChatComponent';
import { GeminiChat } from '../GeminiChat';
import { error } from 'console';

export const VIEW_TYPE_GEMINI_CHAT = 'gemini-chat-view';

export class GeminiChatView extends FileView {

    private chatComponent: ChatComponent;
    private plugin: GeminiPlugin;
    file: TFile | null;
    private titleElement: HTMLTextAreaElement;


    constructor(leaf: WorkspaceLeaf, app: App, plugin: GeminiPlugin) {
        super(leaf);
        this.app = app;
        this.plugin = plugin;
        this.file = null;

        this.contentEl.empty();

        this.contentEl.style.display = "flex";
        this.contentEl.style.flexDirection = "column";

        this.chatComponent = new ChatComponent(this.contentEl, app, plugin);
        this.chatComponent.addListener(this.updateHistory.bind(this))

    }

    private initialiseUI() {
        if (!this.file) return;

        this.contentEl.empty();

        this.contentEl.style.display = "flex";
        this.contentEl.style.flexDirection = "column";

        // Initialise top bar 
        this.titleElement = this.contentEl.createEl("textarea", {
            text: "New Chat",
            cls: "chat-title-text"
        })

        this.titleElement.rows = 1;
        this.titleElement.maxLength = 200;
        this.titleElement.setText(this.file.basename);


        this.titleElement.addEventListener("input", (event) => {
            // Adjust the height of the textarea dynamically
            this.titleElement.style.height = "auto";
            this.titleElement.style.height = (this.titleElement.scrollHeight) + "px";
        });
        this.titleElement.addEventListener("keydown", (ev) => {
            if (ev.key == "Enter") {
                this.titleElement.blur();

                if (this.file && this.titleElement.textContent) {
                    let filepath = this.file?.path.replace(this.file.basename, this.titleElement.value);
                    console.log("renaming " + filepath);
                    this.app.vault.rename(this.file, filepath);
                }

            }
        })
        let topBar = this.contentEl.createDiv({ cls: "chat-top-bar" });

        this.chatComponent = new ChatComponent(this.contentEl, app, this.plugin);
        this.chatComponent.addListener(this.updateHistory.bind(this))
    }


    updateHistory(history: string) {
        if (this.file) {
            this.app.vault.adapter.write(this.file.path, history);
        } else {
            throw error("Can't sync history, file is null");
        }
    }

    async onLoadFile(file: TFile): Promise<void> {

        this.chatComponent.reset();

        this.file = file;
        this.initialiseUI();

        let chat = new GeminiChat(this.plugin, this.app);
        await chat.loadHistoryFromFile(file)

        this.chatComponent.loadChat(chat);

        if (this.chatComponent.GeminiChat.messages.length == 0) {

            this.titleElement.focus()
            this.titleElement.select()
        } else {
            this.chatComponent.focusInput();
        }
    }

    getViewType(): string {
        return VIEW_TYPE_GEMINI_CHAT;
    }

    canAcceptExtension(extension: string): boolean {
        return extension == "gemini";
    }

    getIcon(): IconName {
        return "sparkles"
    }
}
