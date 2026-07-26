import ReviewCard from "@/components/review/ReviewCard";

const MyReviews = () => {
  const url = "/review/my";

  return (
    <div>
      <ReviewCard url={url} />
    </div>
  );
};

export default MyReviews;
