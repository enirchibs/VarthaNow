export function timeAgo(input: string) {
  const diff = Math.max(1, Math.floor((Date.now() - new Date(input).getTime()) / 60000));
  if (diff < 60) return `${diff} నిమిషాల క్రితం`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours} గంటల క్రితం`;
  return `${Math.floor(hours / 24)} రోజుల క్రితం`;
}

export function readingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

export function markdownToHtml(markdown: string) {
  return markdown
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^- (.*$)/gim, "<li>$1</li>")
    .replace(/(<li>[\s\S]*<\/li>)/gim, "<ul>$1</ul>")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>")
    .replace(/<p><h/g, "<h")
    .replace(/<\/h([23])><\/p>/g, "</h$1>")
    .replace(/<p><ul>/g, "<ul>")
    .replace(/<\/ul><\/p>/g, "</ul>");
}
