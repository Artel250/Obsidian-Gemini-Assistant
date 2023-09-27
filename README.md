# Chat with Bard

This plugin enables you to chat with [Google Bard](https://bard.google.com/) directly from obsidian completely for free.

Please note that this is my first obsidian plugin and mistakes are bound to happen. Feel free to report anything you find on the GitHub.
## Setup
In order to be able to use this plugin, you need your own **\_\_Secure-1PSID** token from Bard.
Here is how you get it:
1. Go to: https://bard.google.com/
2. Sign in to your google account
3. Open the Developer tools with `Ctr + Shift + i` (`Option + ⌘ + i` on Mac)
4. Navigate to Application > Cookies
5. Find the \_\_Secure-1PSID cookie and paste its value in the settings of this plugin.

## How to use
1. Select the "Chat with Bard" command in the command palette.
2. Start Chatting 

**Note**: Each time you open the Chat window, it starts a new chat. You can see all of your previous chats at https://bard.google.com/

## Development Plan
  
  - [x] Add basic chat modal
  - [ ] Add the ability to access previous chats 
  - [ ] Bard in the side panel and in a separate window
  - [ ] Give Bard access to the notes
  - [ ] Let Bard type in the notes