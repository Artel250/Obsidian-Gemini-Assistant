# Gemini AI Assistant
This plugin enables you to chat with Google's [Gemini AI](https://gemini.google.com/app) directly from obsidian completely for free.

Please note that this is my first obsidian plugin and mistakes are bound to happen. Feel free to report anything you find on the GitHub.

## Setup
In order to be able to use this plugin, you need your Google Gemini API key.
Here is how you get it:
1. Go to https://ai.google.dev/gemini-api
2. Press "Get API key in Google AI Studio" and log in with your Google account.
3. Press "Get API Key" and the key should appear in the table below.
4. Copy the Key and paste it into this plugins settings.

> [!warning] Information for EU residents
> If you are trying to get your API Key from the EU, Google will require you to set up a billing account with a credit card. You will get a free tier of 300€ for three months and you will not be automatically charged after the trial, unless you manually enable it. [Learn more](https://ai.google.dev/gemini-api/docs/billing#is-Gemini-free-in-EEA-UK-CH)

## How to use
After you have set up your API key, you can use the command "New Gemini Chat" to create a new chat. Alternatively, the plugin will add a ribbon on the right side that also creates a new chat.

**Chats are saved locally**
Because google does not store your chat history through their API, your chats are stored locally with the gemini extensions. This means that your chats are files in your vault - just open the file like any other obsidian note and continue where you left off.

**Default folder for new chats**
By default all of your new chats are created into the "Gemini Chats" folder so that they won't clutter your vault. You can change the default folder in the plugin settings.

**Gemini in the sidebar**
If you want to chat in the sidebar, simply create a new chat and drag and drop it into the sidebar.

**Copy paste**
Gemini uses markdown for its responses. You can just use the clipboard icon at the top of each message to copy it and you can paste it directly into any obsidian note and it will keep all of the formatting.

## Information about Billing
You can see all of the information about Gemini free and paid tiers [here](https://ai.google.dev/pricing). This plugin is using Gemini 1.5 Flash, which falls into the free tier category.
However, if you set up a billing account, enable payments and manage to exceed the free usage limits, you **will be charged**. 

You can find more information about Gemini Billing [here](https://ai.google.dev/gemini-api/docs/billing)

**Development plan**
- [x] General chat capabilities
- [ ] Ability to change model
- [ ] Usage visualizer
- [ ] Prompt templates
- [ ] Generate entire notes with Google Gemini
- [ ] *(**MAYBE**: feature to generate a vault with Gemini (needs more research))*

Thank you for using my plugin. Please feel free to reach out to me on [Github](https://github.com/Artel250/Obsidian-Talk-with-Bard) regarding *ANY* thoughts about the plugin.
