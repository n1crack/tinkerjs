// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
      replaceText(`${type}-version`, process.versions[type])
  }

  window.addEventListener('goToBottom', () => {
      const bottomRef = document.getElementById('bottomRef');
      bottomRef.scrollIntoView({block: 'end', behavior: 'smooth'})
  })
})
