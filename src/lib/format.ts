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

// 🚫 Strip out generic robotic FAQ / Q&A sections from article markdown
export function stripFAQ(markdown: string): string {
  if (!markdown) return "";
  return markdown
    .replace(/(?:##|###)\s*(?:FAQ|తరచుగా అడిగే ప్రశ్నలు)[\s\S]*?(?=(?:##|###)\s*[^\n]+|$)/gi, "")
    .replace(/\*\*FAQ\*\*[\s\S]*/gi, "")
    .trim();
}

export function markdownToHtml(markdown: string) {
  const clean = stripFAQ(markdown);
  return clean
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

// 🤔 Generate a single high-interest open-ended question that prompts reader engagement
export function getOpenEndedQuestion(
  title: string = "",
  content: string = "",
  category: string = "",
  lang: string = "te"
): string {
  const text = (title + " " + content).toLowerCase();

  // 1. Pawan Kalyan / Janasena topics
  if (text.includes("పవన్") || text.includes("కళ్యాణ్") || text.includes("జనసేన") || text.includes("pawan") || text.includes("kalyan")) {
    return lang === "te"
      ? "పవన్ కళ్యాణ్ తాజా రాజకీయ వైఖరి వెనుక గల అసలు కారణాలు ఏమిటై ఉంటాయి? మీరు ఏమనుకుంటున్నారు?"
      : "Have you observed the underlying strategy behind Pawan Kalyan's recent political position?";
  }

  // 2. Jagan Mohan Reddy / YSRCP topics
  if (text.includes("జగన్") || text.includes("వైకాపా") || text.includes("వైఎస్సార్") || text.includes("jagan") || text.includes("ysrcp")) {
    return lang === "te"
      ? "ఈ పరిణామాల వేళ జగన్మోహన్ రెడ్డి తదుపరి కీలక రాజకీయ వ్యూహం ఎలా ఉండబోతోంది?"
      : "What is expected to be Jagan's next major counter-strategy in state politics?";
  }

  // 3. Chandrababu Naidu / AP Govt / Elections
  if (text.includes("చంద్రబాబు") || text.includes("ఏపీ") || text.includes("ఎన్నికలు") || text.includes("బాబు") || text.includes("మున్సిపల్")) {
    return lang === "te"
      ? "ఈ కీలక నిర్ణయం వల్ల రాబోయే రోజుల్లో ఏపీ రాజకీయాల్లో ఎలాంటి మార్పులు రానున్నాయి?"
      : "How will this major governance decision impact the future political landscape?";
  }

  // 4. Revanth / Telangana / Metro / Tech Hub
  if (text.includes("రేవంత్") || text.includes("తెలంగాణ") || text.includes("హైదరాబాద్") || text.includes("మెట్రో") || text.includes("revanth")) {
    return lang === "te"
      ? "హైదరాబాద్ శరవేగ అభివృద్ధి మరియు నూతన ప్రాజెక్టులు సామాన్యుడికి ఎంత మేలు చేస్తాయి?"
      : "How will these dynamic infrastructure moves shape Hyderabad's growth trajectory?";
  }

  // 5. Cinema / Tollywood
  if (category === "cinema" || text.includes("సినిమా") || text.includes("టాలీవుడ్") || text.includes("ఓటీటీ")) {
    return lang === "te"
      ? "ఈ భారీ చిత్రం బాక్సాఫీస్ మరియు డిజిటల్ ప్లాట్‌ఫామ్‌లలో నూతన రికార్డులను సృష్టిస్తుందని భావిస్తున్నారా?"
      : "Do you believe this blockbuster production will set new records in Indian cinema?";
  }

  // 6. Cricket / Sports
  if (category === "cricket" || text.includes("క్రికెట్") || text.includes("ఐపీఎల్") || text.includes("టీమిండియా")) {
    return lang === "te"
      ? "ఈ మ్యాచ్‌లో విజయం సాధించడానికి జట్టు ఎలాంటి వ్యూహాత్మక మార్పులు చేయాల్సి ఉంటుంది?"
      : "What key tactical decision could seal the victory for the team in the upcoming match?";
  }

  // 7. Health
  if (category === "health" || text.includes("ఆరోగ్యం") || text.includes("బిపి") || text.includes("షుగర్")) {
    return lang === "te"
      ? "ఈ సహజ సూత్రాలు మీ దినచర్యలో ఎలాంటి ఆరోగ్యకరమైన మార్పు తెస్తాయో ఆలోచించారా?"
      : "How incorporating these daily natural remedies could transform your long-term health?";
  }

  // 8. Business / Gold / Nifty
  if (category === "business" || text.includes("వ్యాపారం") || text.includes("బంగారం") || text.includes("షేర్లు")) {
    return lang === "te"
      ? "ఈ మార్కెట్ రేస్ వెనుక ప్రధాన కారణాలు ఏంటి? పెట్టుబడిదారులకు ఇది సరైన సమయమేనా?"
      : "What is driving this market momentum, and is this the ideal entry point for investors?";
  }

  // 9. Jobs
  if (category === "jobs" || text.includes("ఉద్యోగాలు") || text.includes("నోటిఫికేషన్")) {
    return lang === "te"
      ? "ఈ నూతన ఉద్యోగ అవకాశాలు అర్హులైన నిరుద్యోగ యువతకు ఎంతవరకు మేలు చేస్తాయి?"
      : "How significantly will these new job openings empower unemployed youth?";
  }

  // Default Open-Ended Question
  return lang === "te"
    ? "ఈ వార్తలోని ప్రధాన పరిణామంపై మీ అభిప్రాయం ఏమిటి? ఇది మున్ముందు ఎలాంటి మార్పులకు దారితీస్తుంది?"
    : "What are your thoughts on this key development and its future implications?";
}
