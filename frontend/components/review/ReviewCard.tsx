"use client";
import { api } from "@/services/axios";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ReviewModal from "../modals/ReviewModal";

const ReviewCard = (props: any) => {
  const { showViewButton = true, url } = props;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openReviewModal, setOpenReviewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);

  const fetchReviews = async () => {
    try {
      const res = await api.get(url);

      console.log("URL: ", url);
      console.log("RESPONSE: ", res.data);

      setReviews(res.data.data);
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">My Reviews</h1>

        <p className="text-gray-500">
          See all the reviews you've shared with mentors.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-xl border p-10 text-center">
          No reviews yet.
        </div>
      ) : (
        reviews.map((review: any) => {
          const r = review.mentorId?.userId ?? review.userId;

          return (
            <div
              key={review._id}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              {/* Header */}
              <div className="flex justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    {r.fullname}
                  </h2>

                  <p className="text-sm text-gray-500">
                    @
                    {r.username}
                  </p>
                </div>

                <p className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Rating */}
              <div className="mt-4 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className={
                      star <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>

              {/* Review Preview */}
              <p
                className={`mt-4 text-gray-700 whitespace-pre-wrap break-words ${
                  showViewButton ? "line-clamp-2" : ""
                }`}
              >
                {review.review}
              </p>

              {/* Footer */}
              {showViewButton && (
                <div className="mt-6 flex justify-end">
                  <button
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                    onClick={() => {
                      setSelectedReview(review);
                      setOpenReviewModal(true);
                    }}
                  >
                    View Review
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}

      {openReviewModal && selectedReview && (
        <ReviewModal
          setIsReviewed={() => {}}
          onClose={() => setOpenReviewModal(false)}
          bookingId={selectedReview.bookingId}
          mode="view"
        />
      )}
    </div>
  );
};

export default ReviewCard;
