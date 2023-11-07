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
        Bard.getBard(plugin.settings.Bard_Token, plugin.settings.Bard_Token_2, plugin.settings.Bard_Token_3).then((result) => {
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

        const conversationsButton = root.createEl('button', {
            text: 'Conversations',
            cls: 'conversation-button'
        });

        let chatInput = root.createDiv('chat-input');
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

        const conversationsList = contentEl.createDiv({
            cls: 'conversations-list hidden' // Initially hidden
        });

        conversationsButton.onClickEvent(() => {

            if (!this.#Bard) {
                new Notice("Bard not ready");
                return;
            }

            while (conversationsList.lastChild) {
                conversationsList.lastChild.remove();
            }

            conversationsList.toggleClass('hidden', false);
            root.toggleClass("hidden", true);

            this.#Bard.getConversations().then((result) => {
                result.forEach((conversation: string[]) => {
                    const listItem = conversationsList.createEl('div', {
                        cls: 'conversation-list-item'
                    });

                    const label = listItem.createEl('span', {
                        text: conversation[1],
                    });

                    // Create the delete button and initially hide it
                    const deleteButton = listItem.createEl('button', {
                        text: 'Delete',
                        cls: 'delete-button' // Add the 'conversation-button' class for styling
                    });
                    deleteButton.style.display = 'none'; // Hide button by default

                    deleteButton.onClickEvent((event) => {
                        event.stopPropagation();
                        deleteButton.parentElement?.remove();
                        this.#Bard.deleteConversation(conversation[0]);
                    })

                    listItem.dataset.conversationId = conversation[0];

                    // Toggle delete button visibility on hover
                    listItem.onmouseenter = () => deleteButton.style.display = 'block';
                    listItem.onmouseleave = () => deleteButton.style.display = 'none';

                    // Clicking a conversation switches to it
                    listItem.onClickEvent(() => {
                        if (listItem.dataset.conversationId != undefined) {
                            this.switchToConversation(listItem.dataset.conversationId);
                            conversationsList.toggleClass('hidden', true); // Hide list after selection
                            root.toggleClass("hidden", false);
                        }
                    })
                });
            });
        });
    }

    clearChat() {
        while (this.#chatMessages.lastChild) {
            this.#chatMessages.lastChild.remove();
        }
    }

    switchToConversation(conversationId: string) {
        this.clearChat();
        this.#Bard.setConversationId(conversationId);
        this.#Bard.getConversation(conversationId).then((result) => {
            result.forEach((element) => {
                this.displayMessage(element["UserMessage"], true);
                this.displayMessage(element["BotResponse"], false)
            })
            this.#Bard.setResponseId(result[result.length - 1]["responseID"])
            this.#Bard.setChoiceId(result[result.length - 1]["choiceId"])
            console.log("=> " + conversationId + " / " + result[result.length - 1]["responseID"] + " / " + result[result.length - 1]["choiceId"]);
        });
    }

    sendMessage() {
        let userMessage = this.#userInput.value;

        if (userMessage == null || userMessage == "") return;

        this.displayMessage(userMessage, true);

        this.#userInput.value = '';

        const botResponseDiv = this.#chatMessages.createEl('div', { cls: 'message bot-message' });
        botResponseDiv.append(this.typingAnimation());

        this.#Bard.getResponse(userMessage).then((response) => {
            botResponseDiv.remove();
            this.displayMessage(response, false);
        });
    }

    displayMessage(text: string, isUser: boolean) {
        let cls = "bot-message";
        if (isUser) {
            cls = "user-message";
        }

        const messageDiv = this.#chatMessages.createEl("div", { cls: "message " + cls });
        MarkdownRenderer.render(this.app, text, messageDiv, "", this.#plugin);
        messageDiv.scrollIntoView({ behavior: "smooth" });
    }

    typingAnimation() {
        const typingAnim = createDiv({ cls: "typing-indicator" })
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
