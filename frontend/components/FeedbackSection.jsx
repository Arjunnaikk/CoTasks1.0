import React, { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { useCreateFeedbackMutation } from "@/services/mutations";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

const FeedbackSection = () => {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comments, setComments] = useState("");

  const mutation = useCreateFeedbackMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating of at least 1 star.",
        variant: "destructive",
      });
      return;
    }

    try {
      await mutation.mutateAsync({
        rating,
        comment: comments.trim() || null,
        userGmail: session?.user?.email,
      });

      toast({
        title: "Thank You!",
        description: "Your feedback was submitted successfully.",
        variant: "dark",
      });

      setRating(0);
      setComments("");
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="text-white w-full max-w-2xl space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white tracking-tight">Feedback & Support</h3>
        <p className="text-zinc-400 text-xs mt-1">We value your thoughts. Let us know how we can improve CoTask.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating selection (Interactive SVG Stars) */}
        <div className="flex flex-col items-start bg-zinc-950/40 p-4 border border-zinc-900 rounded-xl space-y-3">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Rate Your Experience</label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110 active:scale-95 duration-100 p-0.5"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                <Star
                  className={`w-7 h-7 transition-colors duration-150 ${
                    star <= (hoveredRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-zinc-700 hover:text-zinc-500"
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="text-xs font-bold text-yellow-400 ml-2">
                {rating === 1 && "Disappointing 😟"}
                {rating === 2 && "Could be better 😐"}
                {rating === 3 && "Decent experience 🙂"}
                {rating === 4 && "Great platform! 😊"}
                {rating === 5 && "Outstanding work! 🚀"}
              </span>
            )}
          </div>
        </div>

        {/* Comments */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Comments & Details</label>
          <textarea
            placeholder="Tell us what you like or what we can do better..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            maxLength={300}
            className="w-full bg-[#18181b] border border-zinc-800 focus:border-purple-500/50 rounded-xl px-4 py-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 h-32 transition-all duration-200 resize-none leading-relaxed"
          />
          <div className="text-right text-[10px] text-zinc-600 mt-1.5 font-medium">
            {comments.length} / 300 characters
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-white text-zinc-950 hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-white transition-colors font-bold text-xs h-9 px-5 rounded-xl shadow-md flex items-center justify-center active:scale-95 duration-150 cursor-pointer"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackSection;