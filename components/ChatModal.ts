import BardPlugin from "main";
import { App, Modal, Plugin } from "obsidian";
import { send } from "process";

export class ChatModal extends Modal {
    #plugin: BardPlugin;
    #chatMessages: HTMLElement;
    #userInput: HTMLInputElement;


    constructor(app: App, plugin: BardPlugin) {
        super(app);
        this.#plugin = plugin;
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

        if(userMessage == null || userMessage == "") return;

        // Append user message
        this.#chatMessages.createEl('div', { text: userMessage, cls: 'message user-message' });

        // Clear input
        this.#userInput.value = '';

        // TODO: Connect to Bart AI for actual response, using a placeholder for now
        let botResponse = "Hello, I'm Bart!";
        this.#chatMessages.createEl('div', { text: botResponse, cls: 'message bot-message' });
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty(); // Clear modal content
    }
}
