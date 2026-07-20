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
}

const ReviewModal = (props: ReviewModalProps) => {
  const {
    setIsReviewed,
    onClose,
    bookingId,
    initialRating = 0,
    initialReview = "",
    isEdit = false,
  } = props;

  const [rating, setRating] = useState(initialRating);
  const [review, setReview] = useState(initialReview);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRating(initialRating);
    setReview(initialReview);
  }, [initialRating, initialReview]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const res = await api.post("/review/create", {
        rating,
        review: review.trim(),
        bookingId,
      });

      toast.success(res.data.message);

      setIsReviewed(true);

      onClose();
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {isEdit ? "Edit Review" : "Leave Review"}
          </h2>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => setRating(star)}>
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
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border px-4 py-2">
            Cancel
          </button>

          <button onClick={handleSubmit} disabled={rating === 0 || loading}>
            {loading
              ? "Submitting..."
              : isEdit
                ? "Update Review"
                : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
