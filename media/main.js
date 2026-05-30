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
  const slashMenu = document.getElementById('slashMenu');

  const slashCommands = [
    { command: '/you', detail: 'Tampilkan bantuan slash command' },
    { command: '/ask', detail: 'Tanya berdasarkan selection atau file aktif' },
    { command: '/fix', detail: 'Perbaiki selection atau file aktif' },
    { command: '/bugs', detail: 'Cek bug selection atau file aktif' },
    { command: '/file', detail: 'Baca dan jelaskan file aktif' },
    { command: '/project', detail: 'Analisis proyek dan saran perbaikan' },
    { command: '/problems', detail: 'Jelaskan error/warning dari Problems' },
    { command: '/key', detail: 'Simpan API key You.com' },
    { command: '/clear', detail: 'Hapus chat saat ini' },
    { command: '/help', detail: 'Tampilkan bantuan slash command' }
  ];

  let activeSlashIndex = 0;

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
    if (isSlashMenuVisible()) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        moveSlashSelection(1);
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        moveSlashSelection(-1);
        return;
      }

      if (event.key === 'Tab' || event.key === 'Enter') {
        event.preventDefault();
        applyActiveSlashCommand();
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        hideSlashMenu();
        return;
      }
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      sendPrompt();
    }
  });

  promptInput.addEventListener('input', function () {
    updateSlashMenu();
  });

  promptInput.addEventListener('blur', function () {
    setTimeout(hideSlashMenu, 120);
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
    hideSlashMenu();
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
      empty.textContent = 'Mulai chat dengan You.com API langsung dari VS Code. Ketik /you untuk command cepat.';
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

  function updateSlashMenu() {
    const query = promptInput.value.trimStart();

    if (!query.startsWith('/') || query.includes(' ')) {
      hideSlashMenu();
      return;
    }

    const matches = slashCommands.filter(function (item) {
      return item.command.startsWith(query.toLowerCase());
    });

    if (matches.length === 0) {
      hideSlashMenu();
      return;
    }

    activeSlashIndex = Math.min(activeSlashIndex, matches.length - 1);
    renderSlashMenu(matches);
  }

  function renderSlashMenu(items) {
    slashMenu.innerHTML = '';
    slashMenu.hidden = false;
    slashMenu.dataset.count = String(items.length);

    items.forEach(function (item, index) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'slash-item' + (index === activeSlashIndex ? ' active' : '');
      button.dataset.command = item.command;

      const command = document.createElement('span');
      command.className = 'slash-command';
      command.textContent = item.command;

      const detail = document.createElement('span');
      detail.className = 'slash-detail';
      detail.textContent = item.detail;

      button.appendChild(command);
      button.appendChild(detail);
      button.addEventListener('mousedown', function (event) {
        event.preventDefault();
        applySlashCommand(item.command);
      });

      slashMenu.appendChild(button);
    });
  }

  function moveSlashSelection(direction) {
    const count = Number(slashMenu.dataset.count || 0);
    if (!count) {
      return;
    }

    activeSlashIndex = (activeSlashIndex + direction + count) % count;
    updateSlashMenu();
  }

  function applyActiveSlashCommand() {
    const active = slashMenu.querySelector('.slash-item.active');
    if (active instanceof HTMLButtonElement && active.dataset.command) {
      applySlashCommand(active.dataset.command);
    }
  }

  function applySlashCommand(command) {
    promptInput.value = command + (command === '/project' || command === '/problems' || command === '/key' || command === '/clear' || command === '/you' || command === '/help' ? '' : ' ');
    promptInput.focus();
    promptInput.selectionStart = promptInput.value.length;
    promptInput.selectionEnd = promptInput.value.length;
    hideSlashMenu();
  }

  function hideSlashMenu() {
    slashMenu.hidden = true;
    slashMenu.innerHTML = '';
    slashMenu.dataset.count = '0';
    activeSlashIndex = 0;
  }

  function isSlashMenuVisible() {
    return !slashMenu.hidden;
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
