import BardPlugin from "main";
import { App, Modal, Notice, MarkdownRenderer } from "obsidian";
import { send } from "process";
import { Bard } from "./BardConnection";
import { type } from "os";
import { DebugBard } from "./DebugBard";
import { Console } from "console";

export class ChatModal extends Modal {
    #plugin: BardPlugin;
    #chatMessages: HTMLElement;
    #userInput: HTMLInputElement;
    #Bard: Bard;

    #Chat: HTMLElement;
    #Conversations: HTMLElement;


    constructor(app: App, plugin: BardPlugin) {
        super(app);
        this.#plugin = plugin;
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
    }

    onOpen() {
        let { contentEl } = this;

        contentEl.createEl('h3', { text: 'Chat with Bart AI' });
        let root = contentEl.createDiv("chat-modal-content");
        this.#Chat = root.createEl("div", { cls: "chat-interface panel" });

        this.#chatMessages = this.#Chat.createDiv('chat-messages');

        const conversationsButton = this.#Chat.createEl('button', {
            text: 'Conversations',
            cls: 'conversation-button'
        });

        let chatInput = this.#Chat.createDiv('chat-input');
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

        this.#Conversations = root.createDiv({
            cls: 'conversation-list panel hidden' // Initially hidden
        });


        conversationsButton.onClickEvent(() => {
            this.showConversations();
            this.loadConversations();
        });
    }

    showConversations() {
        this.#Chat.classList.add("slide-in")
        //this.#Chat.style.display = "none";
        this.#Conversations.style.transform = 'translateX(0)';
        this.#Conversations.toggleClass("hidden", false);
        this.#Chat.style.pointerEvents = 'none';
        this.#Conversations.style.pointerEvents = "none"

        // disable the chat when animation is complete
        this.#Chat.addEventListener('transitionend', () => {
            this.#Chat.style.display = "none"
            this.#Conversations.style.pointerEvents = "auto";
            console.log("transition to conversations done!");
        }, { once: true });
    }

    showChat() {
        this.#Chat.classList.remove("slide-in");
        this.#Chat.style.display = "flex";
        this.#Chat.style.pointerEvents = "none";
        this.#Conversations.style.pointerEvents = "none"
        this.#Conversations.style.transform = 'translateX(100%)';
        this.#Conversations.style.overflow = "hidden";
        this.#Conversations.addEventListener('transitionend', () => {
            this.#Conversations.toggleClass("hidden", true)
            this.#Chat.style.pointerEvents = "auto";
        }, { once: true });

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

    loadConversations() {
        if (!this.#Bard) {
            new Notice("Bard not ready");
            return;
        }

        while (this.#Conversations.lastChild) {
            this.#Conversations.lastChild.remove();
        }

        //this.#Conversations.toggleClass('hidden', false);
        //this.#Chat.toggleClass("hidden", true);

        this.#Bard.getConversations().then((result) => {
            result.forEach((conversation: string[]) => {
                const listItem = this.#Conversations.createEl('div', {
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
                        this.showChat();
                        // this.#Conversations.toggleClass('hidden', true); // Hide list after selection
                        //this.#Chat.toggleClass("hidden", false);
                    }
                })
            });
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
