function wrapTerminalText(text: string, width = 40): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    if ((line + ' ' + word).trim().length > width) {
      lines.push(line);
      line = word;
    } else {
      line += (line ? ' ' : '') + word;
    }
  }

  if (line) lines.push(line);
  return lines;
}

export { wrapTerminalText };
