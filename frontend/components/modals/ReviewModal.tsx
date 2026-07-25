import { useEffect, useState } from "react";
import { X, Star } from "lucide-react";
import { api } from "@/services/axios";
import toast from "react-hot-toast";

interface ReviewModalProps {
  setIsReviewed(flag: boolean): void;
  onClose(): void;
  bookingId: string;
  initialRating?: number;
  initialReview?: string;
  isEdit?: boolean;
  mode: "create" | "view";
  reviewId?: string;
}

const ReviewModal = (props: ReviewModalProps) => {
  const {
    mode,
    setIsReviewed,
    onClose,
    bookingId,
    initialRating = 0,
    initialReview = "",
    isEdit = false,
    reviewId,
  } = props;

  const [rating, setRating] = useState(initialRating);
  const [review, setReview] = useState(initialReview);
  const [loading, setLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (mode === "view") {
        const res = await api.patch(`/review/${bookingId}`, {
          rating,
          review: review.trim(),
        });

        toast.success(res.data.message);
      } else {
        const res = await api.post("/review/create", {
          rating,
          review: review.trim(),
          bookingId,
        });

        toast.success(res.data.message);

        setIsReviewed(true);
      }

      onClose();
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReview = async () => {
    try {
      // setLoading(true);

      const res = await api.get("/review/view", {
        params: { bookingId },
      });

      setRating(res.data.data.review.rating);
      setReview(res.data.data.review.review);
      setCanEdit(res.data.data.canEdit);
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      // setLoading(false);
    }
  };

  const deleteReview = async () => {
    try {
      setLoadingDelete(true);

      const res = await api.delete(`/review/${bookingId}`);

      toast.success(res.data.message);

      onClose();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRating(initialRating);
    setReview(initialReview);
  }, [initialRating, initialReview]);

  useEffect(() => {
    if (mode === "view") {
      fetchReview();
    }
  }, [mode, bookingId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {mode === "create"
              ? "Leave Review"
              : canEdit
                ? "Edit Review"
                : "View Review"}
          </h2>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              disabled={mode === "view" && !canEdit}
              onClick={() => setRating(star)}
            >
              <Star
                size={34}
                className={`transition ${
                  star <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>

        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={5}
          placeholder="Share your experience..."
          className="mb-6 w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
          disabled={mode === "view" && !canEdit}
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={mode === "view" && canEdit ? deleteReview : onClose}
            className="rounded-lg border px-4 py-2"
          >
            {mode === "view" && canEdit ? "Delete" : "Cancel"}
          </button>

          {(mode === "create" || canEdit) && (
            <button onClick={handleSubmit} disabled={rating === 0 || loading}>
              {loading
                ? "Submitting..."
                : mode === "create"
                  ? "Submit Review"
                  : "Update Review"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
