import BardPlugin from "main";
import { App, Modal, Notice, MarkdownRenderer, Plugin, Editor, EditorPosition } from "obsidian";
import { send } from "process";
import { Bard } from "./BardConnection";
import { type } from "os";
import { DebugBard } from "./DebugBard";
import { Console } from "console";
import { createHash } from "crypto";
import { CursorPos } from "readline";
import { text } from "stream/consumers";

export class InsertTextModal extends Modal {
    #plugin: BardPlugin;
    #editor: Editor;
    #Bard: Bard;
    #replacingSelection: boolean;
    #cursor: EditorPosition;
    #queryPanel: HTMLElement;

    constructor(app: App, plugin: BardPlugin, editor: Editor) {
        super(app);
        this.#plugin = plugin;
        this.#editor = editor;
        if (!this.#plugin.settings.DeveloperMode) {
            Bard.getBard(plugin.settings.Bard_Token, plugin.settings.Bard_Token_2, plugin.settings.Bard_Token_3).then((result) => {
                if (result) {
                    this.#Bard = result;
                }
                else {
                    new Notice("Something went wrong when trying to create a Bard connection");
                }
            });
        } else {
            console.log("BARD running in Dev mode");
            DebugBard.getBard(plugin.settings.Bard_Token, plugin.settings.Bard_Token_2, plugin.settings.Bard_Token_3).
                then(value => this.#Bard = value);
        }

        if (editor.getSelection() == null) {
            this.#replacingSelection = false;
            this.#cursor = editor.getCursor();
        } else {
            this.#replacingSelection = true;
        }
    }

    onOpen(): void {
        let { contentEl } = this;

        this.titleEl.textContent = "Insert text with Bard";

        this.#queryPanel = contentEl.createEl("div", { cls: "insertTextModalContent" });
        let QueryInput = this.#queryPanel.createEl("textarea", { type: "text", placeholder: "Type your input...", cls: "insertTextModalInput" });
        let QueryButton = this.#queryPanel.createEl("button", { text: "Generate Text" })

        QueryButton.onClickEvent((event) => {
            this.GenerateResponse(QueryInput.value)
        })

        this.#queryPanel.addEventListener("keydown", (event) => {
            if (event.key == "Enter") {
                this.GenerateResponse(QueryInput.value);
            }
        })
    }

    GenerateResponse(query: string) {
        if (query == "" || query == undefined) {
            return;
        }
        this.#queryPanel.style.display = "none";

        //create response elements
        let { contentEl } = this;
        let responseContainer = contentEl.createEl("div", { cls: "insertTextModalResponse" });

        const botResponseDiv = responseContainer.createEl('div', { cls: 'message bot-message' });
        botResponseDiv.append(this.typingAnimation());

        this.#Bard.getResponse(query).then((response) => {
            botResponseDiv.remove();
            responseContainer.createEl("div", { text: response })
        })
        let keepButton = responseContainer.createEl("button", { text: "confirm" })
        keepButton.onClickEvent(() => { this.insert(responseContainer.getText()) })

    }

    insert(text: string) {
        if (this.#replacingSelection) {
            this.#editor.replaceSelection(text);
        } else {
            this.#editor.replaceRange(text, this.#cursor);
        }
        this.close();
    }

    typingAnimation() {
        const typingAnim = createDiv({ cls: "typing-indicator" })
        typingAnim.appendChild(createSpan())
        typingAnim.appendChild(createSpan())
        typingAnim.appendChild(createSpan())

        return typingAnim;
    }

}