// NewPost.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, ArrowLeft } from "lucide-react";
import axios from "axios";

const DefaultAvatar = ({ className = "w-10 h-10" }) => (
  <div className={`${className} bg-indigo-100 flex items-center justify-center rounded-full text-indigo-500 border border-indigo-200 shrink-0`}>
    <User size={20} fill="currentColor" fillOpacity={0.2} />
  </div>
);

export default function NewPost() {
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("General");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const currentUserName = localStorage.getItem("user_name") || "User";
  const token = localStorage.getItem("token");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      navigate("/auth");
    }
  }, [token, navigate]);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/posts/",
        {
          content: content,
          tag: tag
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Post created:", response.data);
      
      // Redirect to dashboard after success - FIXED: changed from "/" to "/dashboard"
      navigate("/dashboard");
    } catch (err) {
      console.error("Error creating post:", err);
      if (err.response) {
        alert(err.response.data?.detail || "Failed to create post");
      } else {
        alert("Failed to create post");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Also redirect to dashboard on cancel
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Create New Post</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* User Info */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <DefaultAvatar className="w-12 h-12" />
              <div>
                <p className="font-semibold text-slate-900">{currentUserName}</p>
                <p className="text-sm text-slate-500">Creating a new post</p>
              </div>
            </div>
          </div>

          {/* Post Form */}
          <div className="p-6">
            <textarea
              className="w-full border border-slate-200 rounded-xl p-4 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-700 placeholder:text-slate-400 min-h-[150px]"
              placeholder={`What's on your mind, ${currentUserName.split(' ')[0]}?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
            />
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tag (optional)
              </label>
              <input
                className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="e.g., Tech, Photography, Travel"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || isLoading}
                className={`px-6 py-2.5 rounded-lg font-medium text-white transition-all ${
                  content.trim() && !isLoading
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90"
                    : "bg-slate-300 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Posting...
                  </span>
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {content && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Preview</h3>
            <div className="flex gap-4">
              <DefaultAvatar className="w-10 h-10" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-900">{currentUserName}</span>
                  <span className="text-xs text-slate-400">· just now</span>
                </div>
                <p className="text-slate-700">{content}</p>
                {tag !== "General" && (
                  <span className="inline-block mt-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}