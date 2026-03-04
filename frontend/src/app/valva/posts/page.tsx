"use client";

import { useState, useEffect } from "react";
import forumApi from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function ForumPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterTags, setFilterTags] = useState("");

  const loadPosts = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterCategory) params.category = filterCategory;
      if (filterTags) params.tags = filterTags;

      const response = await forumApi.getPosts(params);
      setPosts(response.results);
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [filterCategory, filterTags]);

  const handleVote = async (postId: string, voteType: string) => {
    try {
      await forumApi.voteOnPost(postId, voteType);
      loadPosts(); // Reload to update scores
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  const handleFlag = async (postId: string) => {
    try {
      await forumApi.flagPost(postId);
      alert("Post flagged for moderation");
    } catch (error) {
      console.error("Failed to flag post:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-simplingua-primary mb-4">
          Valva Forum
        </h1>
        <p className="text-gray-600">
          Connect with the Simplingua community, ask questions, and share knowledge
        </p>
      </div>

      {/* Filter Bar */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            placeholder="Filter by category..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-simplingua-primary focus:border-transparent"
          />
          <input
            type="text"
            value={filterTags}
            onChange={(e) => setFilterTags(e.target.value)}
            placeholder="Filter by tags (comma-separated)..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-simplingua-primary focus:border-transparent"
          />
          <Button onClick={loadPosts} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </Card>

      {/* Posts List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">
          Loading posts...
        </div>
      ) : posts.length === 0 ? (
        <Card className="py-12 text-center text-gray-500">
          No posts found
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post: any) => (
            <Card key={post.id} className="p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-semibold text-simplingua-primary mb-1">
                    {post.title}
                  </h3>
                  <div className="text-sm text-gray-500 mb-2">
                    by{" "}
                    <span className="font-semibold text-simplingua-primary">
                      {post.author_username}
                    </span>
                    {" "}
                    <span className="text-gray-400">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {post.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {post.reply_count} replies
                  </span>
                  <span className="text-sm text-gray-500">
                    {post.view_count} views
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-2">
                {post.content}
              </p>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleVote(post.id, post.user_vote === "up" ? "down" : "up")}
                  >
                    {post.user_vote === "up" ? "▼" : "▲"}
                  </Button>
                  <span className="text-sm font-semibold text-gray-700">
                    {post.vote_score}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleFlag(post.id)}
                  >
                    🚩 Flag
                  </Button>
                  <Button size="sm" variant="primary">
                    Reply
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Post Button */}
      <Card className="text-center py-6">
        <Button size="lg" variant="secondary">
          + Create New Post
        </Button>
      </Card>
    </div>
  );
}
