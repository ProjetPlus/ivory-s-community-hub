import { Heart, MessageCircle, Share2, User, ThumbsUp, Send } from "lucide-react";

interface SocialPreviewProps {
  title: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  authorName?: string;
  authorAvatar?: string;
}

export const SocialPreview = ({
  title,
  content,
  imageUrl,
  videoUrl,
  authorName = "MIPROJET",
  authorAvatar,
}: SocialPreviewProps) => {
  const renderContent = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <br key={i} />;
      
      const parts = trimmed.split(/(#\w+)/g);
      const rendered = parts.map((part, j) => {
        if (part.startsWith('#')) return <span key={j} className="text-primary cursor-pointer hover:underline">{part}</span>;
        return part;
      });

      if (/^[🚀📌🎯✅💡📊💰🌍📧🔹▸]/.test(trimmed)) {
        return <p key={i} className="font-semibold text-foreground mt-2">{rendered}</p>;
      }
      return <p key={i} className="text-foreground/90 text-sm leading-relaxed">{rendered}</p>;
    });
  };

  return (
    <div className="bg-card border rounded-xl overflow-hidden shadow-sm max-w-lg mx-auto">
      {/* Author header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
          {authorAvatar ? (
            <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
          ) : (
            <User className="h-5 w-5 text-primary" />
          )}
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">{authorName}</p>
          <p className="text-xs text-muted-foreground">À l'instant • 🌍</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3 space-y-1">
        {title && <p className="font-bold text-foreground">{title}</p>}
        <div className="text-sm">
          {renderContent(content)}
        </div>
      </div>

      {/* Media */}
      {imageUrl && (
        <div className="w-full">
          <img src={imageUrl} alt="Publication" className="w-full max-h-[400px] object-cover" />
        </div>
      )}
      {videoUrl && (
        <div className="w-full">
          <video src={videoUrl} className="w-full max-h-[400px] object-cover" controls />
        </div>
      )}

      {/* Engagement stats */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-muted-foreground border-b">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px]">👍</span>
            <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[8px]">❤️</span>
          </div>
          <span>24</span>
        </div>
        <span>3 commentaires • 2 partages</span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-around py-2 px-4">
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-muted">
          <ThumbsUp className="h-4 w-4" /> J'aime
        </button>
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-muted">
          <MessageCircle className="h-4 w-4" /> Commenter
        </button>
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-muted">
          <Share2 className="h-4 w-4" /> Partager
        </button>
      </div>
    </div>
  );
};
