// Send the form to our backend without refreshing the page.
const form = document.getElementById('memory-form');
const status = document.getElementById('form-status');
const button = document.getElementById('submit-button');
async function submitMemory(values) {
  if (button.disabled) throw new Error('A message is already being saved.');
  button.disabled = true;
  button.textContent = 'Saving…';
  status.className = '';
  status.textContent = '';
  try {
    const response = await fetch('/api/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to save. Please try again.');
    status.textContent = 'Your memory has been saved. Thank you for sharing it.';
    form.reset();
    status.focus();
    return { saved: true, id: result.id };
  } catch (error) {
    status.className = 'error';
    status.textContent = error instanceof TypeError ? 'Could not connect. Your message is still here; please try again.' : error.message;
    status.focus();
    throw error;
  } finally {
    button.disabled = false;
    button.textContent = 'Save my memory';
  }
}
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = Object.fromEntries(new FormData(form));
  try { await submitMemory(data); } catch { /* The error is already visible above. */ }
});
// Optional browser-agent support. Browsers without it simply skip this block.
if (document.modelContext?.registerTool) {
  const lifetime = new AbortController();
  document.modelContext.registerTool({
    name: 'save_technoblade_memory',
    description: 'Save a nickname and fan memory privately to this tribute. This submits the form.',
    inputSchema: { type: 'object', properties: { nickname: { type: 'string', minLength: 2, maxLength: 40 }, message: { type: 'string', minLength: 10, maxLength: 1000 } }, required: ['nickname', 'message'], additionalProperties: false },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    async execute(input) {
      if (!input || typeof input.nickname !== 'string' || typeof input.message !== 'string') throw new Error('Nickname and message are required.');
      form.elements.nickname.value = input.nickname;
      form.elements.message.value = input.message;
      if (!form.reportValidity()) throw new Error('Check nickname and message lengths.');
      return submitMemory({ nickname: input.nickname, message: input.message, website: '' });
    },
  }, { signal: lifetime.signal });
  window.addEventListener('pagehide', () => lifetime.abort(), { once: true });
}
