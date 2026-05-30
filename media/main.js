(function () {
  const vscode = acquireVsCodeApi();
  const chat = document.getElementById('chat');
  const form = document.getElementById('composer');
  const promptInput = document.getElementById('prompt');
  const sendButton = document.getElementById('sendButton');
  const clearButton = document.getElementById('clearButton');
  const loading = document.getElementById('loading');
  const initialState = document.getElementById('initialState');
  const workspaceToggle = document.getElementById('workspaceToggle');

  const state = {
    messages: [],
    includeWorkspace: false
  };

  restoreState();
  workspaceToggle.checked = state.includeWorkspace;
  render();

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    sendPrompt();
  });

  promptInput.addEventListener('keydown', function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      sendPrompt();
    }
  });

  clearButton.addEventListener('click', function () {
    state.messages = [];
    persistState();
    render();
    vscode.postMessage({ type: 'clearChat' });
  });

  workspaceToggle.addEventListener('change', function () {
    state.includeWorkspace = workspaceToggle.checked;
    persistState();
  });

  window.addEventListener('message', function (event) {
    const message = event.data;

    if (message.type === 'userMessage') {
      addMessage('user', message.text);
    }

    if (message.type === 'assistantMessage') {
      addMessage('assistant', message.text);
    }

    if (message.type === 'error') {
      addMessage('error', message.text);
    }

    if (message.type === 'loading') {
      loading.hidden = !message.value;
      sendButton.disabled = Boolean(message.value);
    }

    if (message.type === 'clearChat') {
      state.messages = [];
      persistState();
      render();
    }
  });

  function sendPrompt() {
    const text = promptInput.value.trim();
    if (!text) {
      return;
    }

    promptInput.value = '';
    vscode.postMessage({
      type: 'sendMessage',
      text,
      includeWorkspace: state.includeWorkspace
    });
  }

  function addMessage(role, text) {
    state.messages.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      role,
      text
    });
    persistState();
    render();
  }

  function render() {
    chat.innerHTML = '';

    if (state.messages.length === 0) {
      const empty = document.createElement('section');
      empty.className = 'empty-state';
      empty.textContent = 'Mulai chat dengan You.com API langsung dari VS Code.';
      chat.appendChild(empty);
      return;
    }

    for (const message of state.messages) {
      const item = document.createElement('article');
      item.className = 'message ' + message.role;

      const label = document.createElement('div');
      label.className = 'message-label';
      label.textContent = roleLabel(message.role);

      const body = document.createElement('div');
      body.className = 'message-body';
      body.innerHTML = renderMarkdown(message.text);

      item.appendChild(label);
      item.appendChild(body);

      if (message.role === 'assistant') {
        item.appendChild(createAssistantActions(message));
      }

      chat.appendChild(item);
    }

    chat.scrollTop = chat.scrollHeight;
  }

  function roleLabel(role) {
    if (role === 'assistant') {
      return 'AI';
    }

    if (role === 'error') {
      return 'Error';
    }

    return 'You';
  }

  function restoreState() {
    const previous = vscode.getState();
    if (previous && Array.isArray(previous.messages)) {
      state.messages = previous.messages;
      state.includeWorkspace = Boolean(previous.includeWorkspace);
      return;
    }

    if (initialState && initialState.dataset.messages) {
      try {
        const savedMessages = JSON.parse(initialState.dataset.messages);
        if (Array.isArray(savedMessages)) {
          state.messages = savedMessages;
        }
      } catch {
        state.messages = [];
      }
    }
  }

  function persistState() {
    vscode.setState({
      messages: state.messages,
      includeWorkspace: state.includeWorkspace
    });
    vscode.postMessage({ type: 'historyChanged', messages: state.messages });
  }

  function createAssistantActions(message) {
    const actions = document.createElement('div');
    actions.className = 'message-actions';

    const copy = createActionButton('Copy', function (button) {
      navigator.clipboard.writeText(message.text);
      flashButton(button, 'Copied');
    });

    const insert = createActionButton('Insert', function (button) {
      vscode.postMessage({ type: 'insertAnswer', text: message.text });
      flashButton(button, 'Sent');
    });

    const replace = createActionButton('Replace Selection', function (button) {
      vscode.postMessage({ type: 'replaceSelection', text: message.text });
      flashButton(button, 'Sent');
    });

    actions.appendChild(copy);
    actions.appendChild(insert);
    actions.appendChild(replace);

    return actions;
  }

  function createActionButton(label, onClick) {
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', function () {
      onClick(button);
    });
    return button;
  }

  function flashButton(button, text) {
    const previous = button.textContent;
    button.textContent = text;
    setTimeout(function () {
      button.textContent = previous;
    }, 1200);
  }

  function renderMarkdown(input) {
    const escaped = escapeHtml(input);
    const withCodeBlocks = escaped.replace(/```([\s\S]*?)```/g, function (_, code) {
      return '<pre><code>' + code.trim() + '</code></pre>';
    });

    return withCodeBlocks
      .replace(/^### (.*)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*)$/gm, '<h2>$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  function escapeHtml(input) {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}());
