export class CustomAnsiToHtml {
  private colorMap: { [key: string]: string } = {
    '30': '#000000',
    '31': '#ff0000',
    '32': '#00ff00',
    '33': '#ffff00',
    '34': '#0000ff',
    '35': '#ff00ff',
    '36': '#00ffff',
    '37': '#ffffff',
    '90': '#808080',
    '91': '#ff5555',
    '92': '#55ff55',
    '93': '#ffff55',
    '94': '#5555ff',
    '95': '#ff55ff',
    '96': '#55ffff',
    '97': '#ffffff',
  };

  toHtml(text: string): string {
    let html = text
      .replace(/\x1b\[(\d+)m/g, (match, code) => {
        if (code === '0') {
          return '</span>';
        }

        const color = this.colorMap[code];
        if (color) {
          return `<span style="color: ${color}">`;
        }

        return '';
      })
      .replace(/\x1b\[[^m]*m/g, '');

    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/&lt;span style="color: ([^"]+)"&gt;/g, '<span style="color: $1">')
      .replace(/&lt;\/span&gt;/g, '</span>');

    return html;
  }
}