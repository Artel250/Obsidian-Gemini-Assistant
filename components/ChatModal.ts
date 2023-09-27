import BardPlugin from "main";
import { App, Modal, Notice, MarkdownRenderer } from "obsidian";
import { send } from "process";
import { Bard } from "./BardConnection";
import { type } from "os";

export class ChatModal extends Modal {
    #plugin: BardPlugin;
    #chatMessages: HTMLElement;
    #userInput: HTMLInputElement;
    #Bard: Bard;


    constructor(app: App, plugin: BardPlugin) {
        super(app);
        this.#plugin = plugin;
        Bard.getBard(plugin.settings.Bard_Token).then((result) => {
            if (result) {
                this.#Bard = result;
            }
            else {
                new Notice("Something went wrong when trying to create a Bard connection");
            }
        });
    }

    onOpen() {
        let { contentEl } = this;

        // Set up the modal structure as previously discussed
        contentEl.createEl('h3', { text: 'Chat with Bart AI' });
        let root = contentEl.createDiv("chat-modal-content");

        this.#chatMessages = root.createDiv('chat-messages');

        let chatInput = contentEl.createDiv('chat-input');
        this.#userInput = chatInput.createEl('input', { type: 'text', placeholder: 'Type your message...' });
        chatInput.createEl('button', {
            text: 'Send'
        }).onClickEvent(() => {
            this.sendMessage();
        });

        this.#userInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.sendMessage();

                // Prevents default behavior (newline) when pressing Enter
                event.preventDefault();
            }
        });
    }

    sendMessage() {
        let userMessage = this.#userInput.value;

        if (userMessage == null || userMessage == "") return;

        this.#chatMessages.createEl('div', { text: userMessage, cls: 'message user-message' }).scrollIntoView({ behavior: "smooth" });;


        this.#userInput.value = '';

        const botResponseDiv = this.#chatMessages.createEl('div', { cls: 'message bot-message' });
        botResponseDiv.append(this.typingAnimation());

        this.#Bard.getResponse(userMessage).then((response) => {
            botResponseDiv.querySelector(".typing-indicator")?.remove();
            MarkdownRenderer.render(this.app, response, botResponseDiv, "", this.#plugin);
            botResponseDiv.scrollIntoView({ behavior: "smooth" });
        });
    }

    typingAnimation() {
        const typingAnim = createDiv({cls:"typing-indicator"})
        typingAnim.appendChild(createSpan())
        typingAnim.appendChild(createSpan())
        typingAnim.appendChild(createSpan())

        return typingAnim;
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty(); // Clear modal content
    }
}
