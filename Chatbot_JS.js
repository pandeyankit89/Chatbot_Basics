function toggleChat() {
  const chatBox = document.getElementById("chat-box");
  const chatButton = document.getElementById("chat-button");

  if (chatBox.style.display === "none" || chatBox.style.display === "") {
    chatBox.style.display = "flex";
    chatButton.style.display = "none";
  } else {
    chatBox.style.display = "none";
    chatButton.style.display = "block";
  }
}

let messageHistory = [];

async function sendMessage() {
  
  const input = document.getElementById("chat-input");
  const message = input.value.trim();

  if (message === "") return;

  const chatMessages = document.getElementById("chat-messages");

  // Add user message
  const userMsg = document.createElement("div");
  userMsg.className = "message user";
  userMsg.textContent = message;
  chatMessages.appendChild(userMsg);

  input.value = ""; // Clear input
  chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom

  try {
    const API_KEY = "MENTION YOU GEMINI API KEY HERE";

    // Ask Gemini and return the bot reply
    async function askGemini(promptText) {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
          })
        }
      );

      const data = await response.json();

      if (data && data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error("No response from Gemini");
      }
    }

    // Await Gemini's reply
	messageHistory.push({ author: "user", content: message });
	
	let promptext_with_context_history = "Answer question " + message + "with previous prompts and answers also -" + messageHistory + "While response Only give Answer."
    const botReply = await askGemini(promptext_with_context_history);

    const botMsg = document.createElement("div");
    botMsg.className = "message bot";
    botMsg.textContent = botReply;
	messageHistory.push({ author: "bot", content: botReply });
	// Replace Markdown-style bold (**text**) with HTML <strong>
	botMsg.innerHTML = "Bot: " + botReply.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    chatMessages.appendChild(botMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
	console.log(messageHistory);

  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    const botMsg = document.createElement("div");
    botMsg.className = "message bot";
    botMsg.textContent = "Bot Error: " + error.message;
    chatMessages.appendChild(botMsg);
  }
}

