import { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Edit3, Eye, Search, Star, Trash2, Sparkles, Upload, Activity } from "lucide-react";
import type { BlogPost, NewsCategory } from "@/types/news";
import { createPost, deletePost, getPosts, getAdminPosts, updatePost } from "@/lib/news-api";
import { categories, categoryLabel } from "@/lib/categories";
import { Button, Input } from "@/components/ui";
import { setMeta } from "@/lib/seo";
import { useLanguage, type Language } from "@/hooks/useLanguage";
import { supabase } from "@/lib/supabase";

export function AdminPage() {
  const { lang } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<BlogPost | null>(null);

  // AI News Writer State
  const [subject, setSubject] = useState("");
  const [writerCategory, setWriterCategory] = useState<NewsCategory>("technology");
  const [writerLanguage, setWriterLanguage] = useState<Language>("te");
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState<Omit<BlogPost, "id" | "created_at" | "updated_at"> | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [editPrompt, setEditPrompt] = useState("");

  // File upload refs & handler
  const draftFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, isDraft: boolean) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage("Uploading image...");
    
    if (!supabase) {
      setMessage("Supabase is not configured.");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `article-images/${fileName}`;

    try {
      // Upload file to the 'news-images' bucket
      const { error: uploadError } = await supabase.storage
        .from("news-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage.from("news-images").getPublicUrl(filePath);
      
      if (isDraft) {
        if (draft) {
          setDraft({ ...draft, og_image: data.publicUrl });
        } else {
          setDraft({
            slug: `news-${Date.now()}`,
            title: subject || "Custom News Article",
            excerpt: "Custom news excerpt.",
            content: "## Article Content",
            category: writerCategory,
            tags: [writerCategory],
            meta_title: subject || "Custom News",
            meta_description: "Custom news description",
            og_image: data.publicUrl,
            author_name: "VarthaNow Editor",
            language: writerLanguage,
            published: true,
            featured: false,
            reading_time_min: 3,
            published_at: new Date().toISOString()
          });
        }
      } else if (!isDraft && editing) {
        setEditing({ ...editing, og_image: data.publicUrl });
      }

      setMessage("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      setMessage(error instanceof Error ? `Upload failed: ${error.message}. Make sure you have created a public bucket named 'news-images' in Supabase.` : "Upload failed.");
    }
  };

  useEffect(() => {
    setMeta({
      title: "Admin Dashboard - VarthaNow",
      description: "Manage AI generated Telugu news articles.",
      canonical: "/admin"
    });
    getAdminPosts(0).then(setPosts).catch((error: Error) => setMessage(error.message));
  }, []);

  const generateArticle = async () => {
    if (!subject.trim()) {
      setMessage("Please enter a news subject.");
      return;
    }
    setIsGenerating(true);
    setMessage("");
    setDraft(null);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    if (!apiKey) {
      setMessage("VITE_GEMINI_API_KEY is not configured in .env");
      setIsGenerating(false);
      return;
    }

    const languageNames: Record<string, string> = {
      te: "Telugu",
      en: "English",
      hi: "Hindi",
      ta: "Tamil",
      kn: "Kannada"
    };

    const targetLanguage = languageNames[writerLanguage] || "Telugu";

    const prompt = `
    You are VarthaNow, a professional news editor. Rewrite the following news subject/topic into an original, copyright-safe, SEO-optimized news article in ${targetLanguage}.
    
    Topic/Subject: ${subject}
    Category: ${writerCategory}
    
    Rules:
    - Write a highly original, compelling news story in ${targetLanguage} using professional, human-like grammar and short readable paragraphs.
    - Do not invent fake statistics.
    - Include markdown headings, bullet points, FAQ, and a conclusion.
    - Return ONLY valid JSON with the exact keys:
      slug, title, excerpt, content, tags, meta_title, meta_description, reading_time_min, image_prompt, featured.
    
    For key "image_prompt":
    Create a highly descriptive prompt (2-3 sentences) in English for a text-to-image generator.
    - If the category or topic is about Vizag (Visakhapatnam), describe a beautiful coastal scenic photograph of Visakhapatnam sea corridor, R.K. Beach road overlooking the blue Bay of Bengal, palm trees, or Kailasagiri.
    - If the category or topic is about Telangana, describe Hyderabad landmarks such as the Charminar, Tank Bund Hussainsagar lake, Birla Mandir, or the Secretariat building.
    - If Andhra Pradesh, describe Prakasam Barrage, Tirumala hills, or Amaravati administrative buildings.
    - For other categories, describe a realistic, professional, editorial news photograph representing the event. Always specify 'no text, no logos, no watermarks, realistic photojournalism style'.
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Gemini API rate limit exceeded (429: Too Many Requests). Since you are on the Google Gemini Free Tier, please wait 30-40 seconds to let the quota refresh, then click 'Generate AI Draft' again!");
        }
        throw new Error(`Gemini failed with status: ${response.status}`);
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
      const cleanJson = textResponse.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(cleanJson);

      const generatedSlug = parsed.slug || subject.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");

      const draftArticle: Omit<BlogPost, "id" | "created_at" | "updated_at"> = {
        slug: generatedSlug,
        title: parsed.title || subject,
        excerpt: parsed.excerpt || `Latest news about: ${subject}`,
        content: parsed.content || `## ${subject}\n\nMore details will be updated soon.`,
        category: writerCategory,
        tags: Array.isArray(parsed.tags) ? parsed.tags : [writerCategory, "News"],
        meta_title: parsed.meta_title || parsed.title || subject,
        meta_description: parsed.meta_description || parsed.excerpt || subject,
        og_image: `/images/${writerCategory}-fallback.jpg`,
        author_name: "VarthaNow AI Writer",
        language: writerLanguage,
        published: true,
        featured: parsed.featured || false,
        reading_time_min: Number(parsed.reading_time_min || 3),
        published_at: new Date().toISOString()
      };

      setDraft(draftArticle);
      setCurrentPrompt("");
      setMessage("AI Draft generated successfully! Cover image fallback applied.");
    } catch (error) {
      setMessage(error instanceof Error ? `Generation failed: ${error.message}` : "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateDraftImage = async (promptToUse: string) => {
    setMessage("Notice: AI cover generation disabled. Category fallback applied.");
    setDraft({ ...draft, og_image: `/images/${writerCategory}-fallback.jpg` } as any);
  };

  const regenerateEditImage = async (promptToUse: string) => {
    setMessage("Notice: AI cover generation disabled. Category fallback applied.");
    if (editing) {
      setEditing({ ...editing, og_image: `/images/${editing.category}-fallback.jpg` } as any);
    }
  };

  const submitDraft = async () => {
    if (!draft) return;
    try {
      const created = await createPost(draft);
      setPosts((items) => [created, ...items]);
      setMessage("Article published successfully!");
      setDraft(null);
      setSubject("");
    } catch (error) {
      setMessage(error instanceof Error ? `Publishing failed: ${error.message}` : "Publishing failed.");
    }
  };

  const visiblePosts = useMemo(() => {
    const value = query.toLowerCase();
    return posts.filter((post) => [post.title, post.category, post.excerpt].join(" ").toLowerCase().includes(value));
  }, [posts, query]);

  const toggle = async (post: BlogPost, key: "published" | "featured") => {
    const next = { ...post, [key]: !post[key] };
    setPosts((items) => items.map((item) => (item.slug === post.slug ? next : item)));
    try {
      await updatePost(post.slug, { [key]: next[key] });
      setMessage("Updated successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Update failed.");
    }
  };

  const remove = async (post: BlogPost) => {
    setPosts((items) => items.filter((item) => item.slug !== post.slug));
    try {
      await deletePost(post.slug);
      setMessage("Deleted successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed.");
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    setPosts((items) => items.map((item) => (item.slug === editing.slug ? editing : item)));
    try {
      await updatePost(editing.slug, {
        title: editing.title,
        excerpt: editing.excerpt,
        content: editing.content,
        meta_title: editing.meta_title,
        meta_description: editing.meta_description,
        tags: editing.tags,
        og_image: editing.og_image
      });
      setMessage("Article saved.");
      setEditing(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    }
  };

  return (
    <main className="container-shell space-y-5 py-4">
      <section className="rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Admin Dashboard</h1>
          <p className="mt-2 text-[hsl(var(--muted-foreground))]">AI articles, publishing status, featured stories and analytics.</p>
        </div>
        <Link
          to="/admin/diagnostics"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-amber-500 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <Activity className="size-4" />
          API Diagnostics
        </Link>
      </section>
      <section className="grid gap-3 md:grid-cols-4">
        {[
          ["Total news", posts.length],
          ["Published", posts.filter((post) => post.published).length],
          ["Featured", posts.filter((post) => post.featured).length],
          ["Categories", new Set(posts.map((post) => post.category)).size]
        ].map(([label, value]) => (
          <div key={label} className="rounded-[1.3rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
            <BarChart3 className="mb-4 size-5 text-[hsl(var(--primary))]" />
            <div className="text-2xl font-black">{value}</div>
            <div className="text-sm font-bold text-[hsl(var(--muted-foreground))]">{label}</div>
          </div>
        ))}
      </section>

      {/* ✨ AI News Writer Panel */}
      <section className="rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-[0_12px_30px_rgba(37,99,235,0.08)]">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="size-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-black">AI News Writer (Gemini)</h2>
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))] font-bold mb-4">
          Type any topic, choose a category and target language, and generate an SEO-optimized, highly engaging news story instantly.
        </p>
        
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
          <Input 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
            placeholder="Enter news subject (e.g. Visakhapatnam Beach Corridor road development plans)..." 
            className="flex-1"
          />
          <select 
            value={writerCategory} 
            onChange={(e) => setWriterCategory(e.target.value as any)} 
            className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-sm font-bold outline-none focus:border-[hsl(var(--primary))]"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.label[lang] || c.label.en}</option>
            ))}
          </select>
          <select 
            value={writerLanguage} 
            onChange={(e) => setWriterLanguage(e.target.value as any)} 
            className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-sm font-bold outline-none focus:border-[hsl(var(--primary))]"
          >
            <option value="te">Telugu (తెలుగు)</option>
            <option value="en">English</option>
            <option value="hi">Hindi (हिन्दी)</option>
            <option value="ta">Tamil (தமிழ்)</option>
            <option value="kn">Kannada (ಕನ್ನಡ)</option>
          </select>
          <Button 
            onClick={generateArticle} 
            disabled={isGenerating || !subject.trim()} 
            className="font-black bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-3xl"
          >
            {isGenerating ? "Generating..." : "Generate AI Draft"}
          </Button>
        </div>

        {/* AI Draft Review Editor */}
        {draft && (
          <div className="mt-5 border-t border-[hsl(var(--border))]/50 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-blue-600 dark:text-blue-400">✨ Review Generated AI News Draft</h3>
              <Button variant="secondary" onClick={() => setDraft(null)} className="h-8 text-xs px-3">Clear Draft</Button>
            </div>
            
            <div className="grid gap-3">
              <div>
                <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] block mb-1">Article Title</label>
                <Input 
                  value={draft.title} 
                  onChange={(e) => setDraft({ ...draft, title: e.target.value, meta_title: e.target.value })} 
                  placeholder="Title" 
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] block mb-1">Short Excerpt (SEO Description)</label>
                <Input 
                  value={draft.excerpt} 
                  onChange={(e) => setDraft({ ...draft, excerpt: e.target.value, meta_description: e.target.value })} 
                  placeholder="Excerpt" 
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] block mb-1">Content (Markdown format supported)</label>
                <textarea
                  value={draft.content}
                  onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                  className="min-h-56 w-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-sm outline-none focus:border-[hsl(var(--primary))]"
                  placeholder="Write/edit your article content here..."
                />
              </div>
              
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] block mb-1">Tags (Comma separated)</label>
                  <Input 
                    value={draft.tags.join(", ")} 
                    onChange={(e) => setDraft({ ...draft, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })} 
                    placeholder="Tags" 
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] block mb-1">Image URL Preview</label>
                  <Input 
                    value={draft.og_image || ""} 
                    onChange={(e) => setDraft({ ...draft, og_image: e.target.value })} 
                    placeholder="Image URL" 
                  />
                </div>
              </div>

              <div className="border-t border-[hsl(var(--border))]/30 pt-3">
                <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] block mb-1">AI Image Generator Prompt</label>
                <div className="flex gap-2">
                  <Input 
                    value={currentPrompt} 
                    onChange={(e) => setCurrentPrompt(e.target.value)} 
                    placeholder="Enter descriptive prompt for new image..." 
                    className="flex-1"
                  />
                  <Button 
                    variant="secondary" 
                    type="button"
                    onClick={() => regenerateDraftImage(currentPrompt)}
                    className="font-bold text-xs"
                  >
                    Re-generate Image
                  </Button>
                  <input 
                    type="file" 
                    ref={draftFileRef} 
                    onChange={(e) => handleFileUpload(e, true)} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <Button 
                    variant="secondary" 
                    type="button"
                    onClick={() => draftFileRef.current?.click()}
                    className="font-bold text-xs flex items-center gap-1.5"
                  >
                    <Upload className="size-3.5" />
                    Upload File
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm font-bold cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={draft.featured} 
                    onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} 
                    className="rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
                  />
                  Mark as Featured Story
                </label>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[hsl(var(--border))]/50 pt-4">
                {draft.og_image && (
                  <div className="relative aspect-[16/10] w-36 overflow-hidden rounded-2xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
                    <img src={draft.og_image} alt="AI generated preview" referrerPolicy="no-referrer" className="size-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-[9px] font-black text-white uppercase tracking-wider">Preview</div>
                  </div>
                )}
                <div className="flex gap-2 ml-auto">
                  <Button onClick={submitDraft} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 rounded-3xl">
                    Submit & Publish News Article
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-11" placeholder="Search articles..." />
          </div>
          <Button onClick={() => getAdminPosts(0).then(setPosts)}>Refresh</Button>
        </div>
        {message && <div className="mb-3 rounded-2xl bg-[hsl(var(--muted))] p-3 text-sm font-bold">{message}</div>}
        <div className="space-y-3">
          {visiblePosts.map((post) => (
            <div key={post.slug} className="grid gap-3 rounded-2xl bg-[hsl(var(--muted))] p-3 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="line-clamp-1 font-black">{post.title}</div>
                <div className="mt-1 text-xs font-bold text-[hsl(var(--muted-foreground))]">
                  {categoryLabel(post.category)} · {post.published ? "Published" : "Draft"} · {post.featured ? "Featured" : "Normal"}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => toggle(post, "published")}>
                  <Eye className="size-4" />
                  {post.published ? "Draft" : "Publish"}
                </Button>
                <Button variant="secondary" onClick={() => toggle(post, "featured")}>
                  <Star className="size-4" />
                  Feature
                </Button>
                <Button variant="secondary" onClick={() => {
                  setEditing(post);
                  const match = post.og_image?.match(/\/prompt\/(.+?)\?/);
                  setEditPrompt(match ? decodeURIComponent(match[1]) : "");
                }}>
                  <Edit3 className="size-4" />
                  Edit
                </Button>
                <Button variant="secondary" onClick={() => remove(post)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
      {editing && (
        <section className="rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <h2 className="mb-4 text-xl font-black">Edit AI Article</h2>
          <div className="grid gap-3">
            <Input value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value, meta_title: event.target.value })} />
            <Input value={editing.excerpt} onChange={(event) => setEditing({ ...editing, excerpt: event.target.value, meta_description: event.target.value })} />
            <textarea
              value={editing.content}
              onChange={(event) => setEditing({ ...editing, content: event.target.value })}
              className="min-h-56 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-sm outline-none focus:border-[hsl(var(--primary))]"
            />
            <Input
              value={editing.tags.join(", ")}
              onChange={(event) => setEditing({ ...editing, tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })}
              placeholder="Tags"
            />

            <div className="grid gap-3 sm:grid-cols-2 border-t border-[hsl(var(--border))]/30 pt-3">
              <div>
                <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] block mb-1">Image URL / Cover Preview</label>
                <Input 
                  value={editing.og_image || ""} 
                  onChange={(event) => setEditing({ ...editing, og_image: event.target.value })} 
                  placeholder="Image URL" 
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] block mb-1">AI Image Generator Prompt</label>
                <div className="flex gap-2">
                  <Input 
                    value={editPrompt} 
                    onChange={(event) => setEditPrompt(event.target.value)} 
                    placeholder="Enter descriptive prompt for new image..." 
                    className="flex-1"
                  />
                  <Button 
                    variant="secondary" 
                    type="button"
                    onClick={() => regenerateEditImage(editPrompt)}
                    className="font-bold text-xs"
                  >
                    Re-generate
                  </Button>
                  <input 
                    type="file" 
                    ref={editFileRef} 
                    onChange={(e) => handleFileUpload(e, false)} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <Button 
                    variant="secondary" 
                    type="button"
                    onClick={() => editFileRef.current?.click()}
                    className="font-bold text-xs flex items-center gap-1.5"
                  >
                    <Upload className="size-3.5" />
                    Upload File
                  </Button>
                </div>
              </div>
            </div>

            {editing.og_image && (
              <div className="relative aspect-[16/10] w-48 overflow-hidden rounded-2xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] mt-2">
                <img src={editing.og_image} alt="AI cover preview" referrerPolicy="no-referrer" className="size-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-black text-white uppercase tracking-wider">Cover Image Preview</div>
              </div>
            )}
            
            <div className="flex gap-2 border-t border-[hsl(var(--border))]/30 pt-3">
              <Button onClick={saveEdit}>Save article</Button>
              <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
