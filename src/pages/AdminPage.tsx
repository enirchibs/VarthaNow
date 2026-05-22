import { useEffect, useMemo, useState } from "react";
import { BarChart3, Edit3, Eye, Search, Star, Trash2 } from "lucide-react";
import type { BlogPost } from "@/types/news";
import { deletePost, getPosts, updatePost } from "@/lib/news-api";
import { categoryLabel } from "@/lib/categories";
import { Button, Input } from "@/components/ui";
import { setMeta } from "@/lib/seo";

export function AdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<BlogPost | null>(null);

  useEffect(() => {
    setMeta({
      title: "Admin Dashboard - VarthaNow",
      description: "Manage AI generated Telugu news articles.",
      canonical: "/admin"
    });
    getPosts(0).then(setPosts).catch((error: Error) => setMessage(error.message));
  }, []);

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
        tags: editing.tags
      });
      setMessage("Article saved.");
      setEditing(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    }
  };

  return (
    <main className="container-shell space-y-5 py-4">
      <section className="rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
        <h1 className="text-3xl font-black">Admin Dashboard</h1>
        <p className="mt-2 text-[hsl(var(--muted-foreground))]">AI articles, publishing status, featured stories and analytics.</p>
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
      <section className="rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-11" placeholder="Search articles..." />
          </div>
          <Button onClick={() => getPosts(0).then(setPosts)}>Refresh</Button>
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
                <Button variant="secondary" onClick={() => setEditing(post)}>
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
            <div className="flex gap-2">
              <Button onClick={saveEdit}>Save article</Button>
              <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
