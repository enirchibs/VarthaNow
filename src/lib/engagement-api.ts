import type { BlogPost, ArticlePoll, PollOption, ReaderOpinion } from "@/types/news";
import { supabase } from "@/lib/supabase";

// 1. INTELLIGENT QUESTION GENERATOR
export function getOpenEndedQuestion(
  post?: BlogPost | null,
  lang: string = "te"
): string {
  if (!post) {
    return lang === "te"
      ? "ఈ వార్తలోని ప్రధాన పరిణామంపై మీ అభిప్రాయం ఏమిటి?"
      : "What are your thoughts on this key development?";
  }

  const title = (post.title || "").toLowerCase();
  const excerpt = (post.excerpt || "").toLowerCase();
  const content = (post.content || "").toLowerCase();
  const cat = (post.category || "").toLowerCase();
  const text = `${title} ${excerpt} ${content}`;

  // 1. Pawan Kalyan / Janasena topics
  if (
    text.includes("పవన్") ||
    text.includes("కళ్యాణ్") ||
    text.includes("జనసేన") ||
    text.includes("pawan") ||
    text.includes("kalyan")
  ) {
    return lang === "te"
      ? "పవన్ కళ్యాణ్ తాజా రాజకీయ వైఖరి వెనుక అసలు వ్యూహం ఏమై ఉంటుందని మీరు అనుకుంటున్నారు?"
      : "What could be the underlying political strategy behind Pawan Kalyan's move?";
  }

  // 2. Jagan / YSRCP topics
  if (
    text.includes("జగన్") ||
    text.includes("వైకాపా") ||
    text.includes("వైఎస్సార్") ||
    text.includes("jagan") ||
    text.includes("ysrcp")
  ) {
    return lang === "te"
      ? "ఈ పరిణామాల తర్వాత జగన్ తదుపరి కీలక రాజకీయ వ్యూహం ఎలా ఉండబోతోందని మీరు భావిస్తున్నారు?"
      : "What is expected to be Jagan's next key political move in AP politics?";
  }

  // 3. AP Politics / Elections
  if (
    text.includes("చంద్రబాబు") ||
    text.includes("ఏపీ") ||
    text.includes("ఎన్నికలు") ||
    text.includes("బాబు") ||
    text.includes("మున్సిపల్") ||
    text.includes("సచివాలయం")
  ) {
    if (text.includes("ఎన్నికలు") || text.includes("election")) {
      return lang === "te"
        ? "ఈ పరిణామం వచ్చే ఎన్నికల ఫలితాలపై ఎంత ప్రభావం చూపుతుందని మీరు భావిస్తున్నారు?"
        : "How will this major development impact the upcoming election outcome?";
    }
    return lang === "te"
      ? "ఈ నిర్ణయం రాబోయే రోజుల్లో ఏపీ రాజకీయాలను ఎలా ప్రభావితం చేస్తుందని మీరు అనుకుంటున్నారు?"
      : "How will this decision impact the political landscape of Andhra Pradesh?";
  }

  // 4. Vizag / Visakhapatnam / Local
  if (
    cat === "vizag" ||
    text.includes("విశాఖ") ||
    text.includes("విశాఖపట్నం") ||
    text.includes("vizag") ||
    text.includes("visakhapatnam") ||
    text.includes("మధురవాడ") ||
    text.includes("గాజువాక")
  ) {
    return lang === "te"
      ? "ఈ ప్రాజెక్ట్ విశాఖలో ఉద్యోగాలు మరియు వ్యాపార అవకాశాలను నిజంగా పెంచుతుందని మీరు భావిస్తున్నారా?"
      : "Do you believe this project will boost jobs and business opportunities in Vizag?";
  }

  // 5. Telangana / Hyderabad
  if (
    cat === "telangana" ||
    text.includes("తెలంగాణ") ||
    text.includes("హైదరాబాద్") ||
    text.includes("రేవంత్") ||
    text.includes("మెట్రో") ||
    text.includes("hyderabad") ||
    text.includes("telangana")
  ) {
    return lang === "te"
      ? "హైదరాబాద్‌లో జరుగుతున్న ఈ అభివృద్ధి సామాన్యుడి జీవితాన్ని నిజంగా ఎంతవరకు మార్చగలదు?"
      : "How significantly will this development in Hyderabad impact everyday citizens?";
  }

  // 6. Cinema / Tollywood
  if (
    cat === "cinema" ||
    text.includes("సినిమా") ||
    text.includes("టాలీవుడ్") ||
    text.includes("ఓటీటీ") ||
    text.includes("హీరో") ||
    text.includes("movie")
  ) {
    return lang === "te"
      ? "ఈ సినిమా బాక్సాఫీస్ వద్ద అంచనాలను అందుకుంటుందని మీరు భావిస్తున్నారా?"
      : "Do you believe this movie will meet box office expectations?";
  }

  // 7. Cricket / Sports
  if (
    cat === "cricket" ||
    text.includes("క్రికెట్") ||
    text.includes("ఐపీఎల్") ||
    text.includes("టీమిండియా") ||
    text.includes("cricket")
  ) {
    return lang === "te"
      ? "ఈ నిర్ణయం/ప్రదర్శన తర్వాత జట్టు తదుపరి మ్యాచ్‌లో మెరుగైన ఫలితం సాధిస్తుందని మీరు భావిస్తున్నారా?"
      : "Do you think the team will achieve a better result in the next match after this move?";
  }

  // 8. Business / Gold / Nifty
  if (
    cat === "business" ||
    text.includes("వ్యాపారం") ||
    text.includes("బంగారం") ||
    text.includes("షేర్లు") ||
    text.includes("స్టాక్")
  ) {
    return lang === "te"
      ? "ఈ పరిణామం సాధారణ వినియోగదారుడిపై ఎక్కువగా ప్రభావం చూపుతుందని మీరు భావిస్తున్నారా?"
      : "Do you think this market trend will heavily impact the common consumer?";
  }

  // 9. Health
  if (
    cat === "health" ||
    text.includes("ఆరోగ్యం") ||
    text.includes("బిపి") ||
    text.includes("షుగర్") ||
    text.includes("ఒత్తిడి")
  ) {
    return lang === "te"
      ? "ఈ ఆరోగ్య సూచనలను ప్రజలు తమ రోజువారీ జీవితంలో పాటించడం ఎంతవరకు సాధ్యమని మీరు భావిస్తున్నారు?"
      : "How practical is it for people to adopt these health recommendations daily?";
  }

  // 10. Infrastructure / Development / Jobs
  if (
    cat === "jobs" ||
    text.includes("ఉద్యోగాలు") ||
    text.includes("ప్రాజెక్ట్") ||
    text.includes("రహదారి") ||
    text.includes("పోర్ట్")
  ) {
    return lang === "te"
      ? "ఈ ప్రాజెక్ట్ పూర్తయిన తర్వాత స్థానిక ప్రజలకు కలిగే అతిపెద్ద ప్రయోజనం ఏమిటని మీరు భావిస్తున్నారు?"
      : "What do you think is the biggest benefit for locals once this project is complete?";
  }

  // Safe Category Fallbacks
  return lang === "te"
    ? "ఈ వార్తలోని ప్రధాన అంశంపై మీ అభిప్రాయం ఏమిటి?"
    : "What is your perspective on this key news update?";
}

// 2. DYNAMIC 3-OPTION POLL GENERATOR
export function getPollOptions(
  post?: BlogPost | null,
  lang: string = "te"
): PollOption[] {
  if (!post) {
    return [
      { id: "opt_1", text: lang === "te" ? "🟢 అనుకూలంగా ఉంది" : "🟢 Positive", count: 0 },
      { id: "opt_2", text: lang === "te" ? "🟡 వేచి చూడాలి" : "🟡 Neutral / Wait & See", count: 0 },
      { id: "opt_3", text: lang === "te" ? "⚪ ప్రభావం ఉండకపోవచ్చు" : "⚪ Low Impact", count: 0 }
    ];
  }

  const title = (post.title || "").toLowerCase();
  const text = `${title} ${(post.excerpt || "")} ${(post.category || "")}`.toLowerCase();
  const cat = (post.category || "").toLowerCase();

  // Pawan Kalyan / Jagan / Strategy
  if (text.includes("పవన్") || text.includes("జగన్") || text.includes("వ్యూహం")) {
    return [
      { id: "opt_1", text: lang === "te" ? "🟢 సరైన వ్యూహం" : "🟢 Right Strategy", count: 0 },
      { id: "opt_2", text: lang === "te" ? "🟡 వేచి చూడాలి" : "🟡 Wait and See", count: 0 },
      { id: "opt_3", text: lang === "te" ? "🔴 ప్రభావం ఉండకపోవచ్చు" : "🔴 May Not Work", count: 0 }
    ];
  }

  // Cinema / Tollywood
  if (cat === "cinema" || text.includes("సినిమా") || text.includes("ఓటీటీ")) {
    return [
      { id: "opt_1", text: lang === "te" ? "🔥 బ్లాక్‌బస్టర్ అవుతుంది" : "🔥 Blockbuster", count: 0 },
      { id: "opt_2", text: lang === "te" ? "👍 హిట్ అయ్యే అవకాశం ఉంది" : "👍 Potential Hit", count: 0 },
      { id: "opt_3", text: lang === "te" ? "🤔 అంచనా వేయడం కష్టం" : "🤔 Hard to Predict", count: 0 }
    ];
  }

  // Cricket / Sports
  if (cat === "cricket" || text.includes("క్రికెట్") || text.includes("ఐపీఎల్")) {
    return [
      { id: "opt_1", text: lang === "te" ? "🟢 ఖచ్చితంగా సాధిస్తుంది" : "🟢 Definitely Yes", count: 0 },
      { id: "opt_2", text: lang === "te" ? "🟡 పోటీ తీవ్రంగా ఉంటుంది" : "🟡 Tough Contest", count: 0 },
      { id: "opt_3", text: lang === "te" ? "🔴 కష్టమనిపిస్తోంది" : "🔴 Looks Difficult", count: 0 }
    ];
  }

  // Vizag / Jobs / Infrastructure / Telangana / AP
  if (
    cat === "vizag" ||
    cat === "jobs" ||
    cat === "andhra-pradesh" ||
    cat === "telangana" ||
    text.includes("ఉద్యోగాలు") ||
    text.includes("ప్రాజెక్ట్")
  ) {
    return [
      { id: "opt_1", text: lang === "te" ? "🟢 భారీగా పెరుగుతాయి" : "🟢 Significant Growth", count: 0 },
      { id: "opt_2", text: lang === "te" ? "🟡 కొంతవరకు పెరుగుతాయి" : "🟡 Moderate Growth", count: 0 },
      { id: "opt_3", text: lang === "te" ? "⚪ మార్పు ఉండకపోవచ్చు" : "⚪ Minimal Impact", count: 0 }
    ];
  }

  // Health
  if (cat === "health" || text.includes("ఆరోగ్యం")) {
    return [
      { id: "opt_1", text: lang === "te" ? "🟢 ఖచ్చితంగా సాధ్యమే" : "🟢 Easily Feasible", count: 0 },
      { id: "opt_2", text: lang === "te" ? "🟡 పాక్షికంగా పాటించవచ్చు" : "🟡 Partially Possible", count: 0 },
      { id: "opt_3", text: lang === "te" ? "⚪ పాటించడం కష్టం" : "⚪ Hard to Follow", count: 0 }
    ];
  }

  // Default Policy / Impact Options
  return [
    { id: "opt_1", text: lang === "te" ? "🟢 పెద్ద ప్రభావం ఉంటుంది" : "🟢 Major Impact", count: 0 },
    { id: "opt_2", text: lang === "te" ? "🟡 కొంత ప్రభావం ఉంటుంది" : "🟡 Moderate Impact", count: 0 },
    { id: "opt_3", text: lang === "te" ? "⚪ పెద్దగా ప్రభావం ఉండదు" : "⚪ Low Impact", count: 0 }
  ];
}

// 3. READ & SUBMIT ARTICLE POLL
export async function getArticlePoll(
  slug: string,
  post?: BlogPost | null,
  lang: string = "te"
): Promise<ArticlePoll> {
  const defaultQuestion = getOpenEndedQuestion(post, lang);
  const defaultOptions = getPollOptions(post, lang);

  // Check Local Storage for vote counts / cached state
  const localVotesKey = `vaartanow_poll_counts_${slug}`;
  let storedCounts: Record<string, number> = {};
  try {
    const raw = localStorage.getItem(localVotesKey);
    if (raw) storedCounts = JSON.parse(raw);
  } catch {}

  let totalVotes = 0;
  const mergedOptions = defaultOptions.map((opt) => {
    const count = storedCounts[opt.id] ?? Math.floor(Math.abs(hashString(slug + opt.id) % 150) + 12); // Seeded realistic baseline
    totalVotes += count;
    return { ...opt, count };
  });

  // Try fetching real Supabase totals if connected
  if (supabase) {
    try {
      const { data } = await supabase
        .from("polls")
        .select("id, question, options")
        .eq("article_id", post?.id || slug)
        .maybeSingle();

      if (data) {
        return {
          id: data.id,
          post_slug: slug,
          question: data.question || defaultQuestion,
          options: data.options as PollOption[],
          total_votes: (data.options as PollOption[]).reduce((sum, o) => sum + (o.count || 0), 0),
          engagement_enabled: true
        };
      }
    } catch (e) {
      console.warn("Supabase getArticlePoll warning:", e);
    }
  }

  return {
    id: `poll_${slug}`,
    post_slug: slug,
    question: defaultQuestion,
    options: mergedOptions,
    total_votes: totalVotes,
    engagement_enabled: true
  };
}

export async function submitPollVote(
  slug: string,
  optionId: string,
  currentPoll: ArticlePoll
): Promise<{ poll: ArticlePoll; selectedOptionId: string }> {
  // Save vote choice locally to prevent duplicate votes
  localStorage.setItem(`vaartanow_voted_${slug}`, optionId);

  // Update local vote counts cache
  const localVotesKey = `vaartanow_poll_counts_${slug}`;
  let storedCounts: Record<string, number> = {};
  try {
    const raw = localStorage.getItem(localVotesKey);
    if (raw) storedCounts = JSON.parse(raw);
  } catch {}

  const currentCount = storedCounts[optionId] || currentPoll.options.find((o) => o.id === optionId)?.count || 0;
  storedCounts[optionId] = currentCount + 1;
  localStorage.setItem(localVotesKey, JSON.stringify(storedCounts));

  const updatedOptions = currentPoll.options.map((opt) => {
    if (opt.id === optionId) {
      return { ...opt, count: opt.count + 1 };
    }
    return opt;
  });

  const updatedPoll: ArticlePoll = {
    ...currentPoll,
    options: updatedOptions,
    total_votes: currentPoll.total_votes + 1
  };

  // Try upserting to Supabase if available
  if (supabase) {
    try {
      await supabase.from("polls").upsert(
        {
          article_id: currentPoll.post_slug,
          question: currentPoll.question,
          options: updatedOptions
        },
        { onConflict: "article_id" }
      );
    } catch (e) {
      console.warn("Supabase submitPollVote warning:", e);
    }
  }

  trackEngagementEvent("poll_completed", { slug, optionId });
  return { poll: updatedPoll, selectedOptionId: optionId };
}

// 4. READ & SUBMIT READER OPINIONS / COMMENTS
export async function getArticleOpinions(slug: string): Promise<ReaderOpinion[]> {
  const localKey = `vaartanow_opinions_${slug}`;
  let localOpinions: ReaderOpinion[] = [];
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) localOpinions = JSON.parse(raw);
  } catch {}

  // Try Supabase fetch if available
  if (supabase) {
    try {
      const { data } = await supabase
        .from("comments")
        .select("id, body, created_at, moderation_status")
        .eq("article_id", slug)
        .order("created_at", { ascending: false })
        .limit(10);

      if (data && data.length > 0) {
        const fetched = data.map((item: any) => ({
          id: item.id,
          post_slug: slug,
          comment: item.body,
          display_name: "পাঠకుడు",
          created_at: item.created_at
        }));
        return [...localOpinions, ...fetched];
      }
    } catch (e) {
      console.warn("Supabase getArticleOpinions warning:", e);
    }
  }

  return localOpinions;
}

export async function submitReaderOpinion(
  slug: string,
  opinion: Omit<ReaderOpinion, "id" | "created_at">
): Promise<ReaderOpinion[]> {
  const newOpinion: ReaderOpinion = {
    id: `op_${Date.now()}`,
    post_slug: slug,
    comment: opinion.comment,
    display_name: opinion.display_name?.trim() || "పాఠకుడు",
    locality: opinion.locality || "",
    selected_option_id: opinion.selected_option_id,
    created_at: new Date().toISOString()
  };

  const localKey = `vaartanow_opinions_${slug}`;
  let localOpinions: ReaderOpinion[] = [];
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) localOpinions = JSON.parse(raw);
  } catch {}

  const updated = [newOpinion, ...localOpinions];
  localStorage.setItem(localKey, JSON.stringify(updated));

  if (supabase) {
    try {
      await supabase.from("comments").insert({
        article_id: slug,
        body: opinion.comment,
        moderation_status: "approved"
      });
    } catch (e) {
      console.warn("Supabase submitReaderOpinion warning:", e);
    }
  }

  trackEngagementEvent("opinion_submitted", { slug, locality: opinion.locality });
  return updated;
}

// 5. ANALYTICS EVENT TRACKER
export function trackEngagementEvent(eventName: string, metadata?: Record<string, any>) {
  try {
    console.log(`[Analytics Event]: ${eventName}`, metadata);
    const storedEvents = JSON.parse(localStorage.getItem("vaartanow_analytics_events") || "[]");
    storedEvents.push({
      event: eventName,
      metadata,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem("vaartanow_analytics_events", JSON.stringify(storedEvents.slice(-100)));
  } catch (e) {
    console.warn("Analytics error:", e);
  }
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
