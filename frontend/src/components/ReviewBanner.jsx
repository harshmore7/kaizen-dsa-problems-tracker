import { useState, useEffect } from "react";
import api from "../api";
import ReviewModal from "./ReviewModal";

export default function ReviewBanner({ onReviewed }) {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [index, setIndex] = useState(0);

  const fetchQueue = async () => {
    const res = await api.get("/review-queue/");
    setQueue(res.data.problems);
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  if (queue.length === 0) return null;

  const handleOpen = () => setCurrent(queue[index]);
  const handleClose = () => setCurrent(null);
  const handleReviewed = () => {
    const next = index + 1;
    if (next < queue.length) {
      setIndex(next);
      setCurrent(queue[next]);
    } else {
      setIndex(0);
      setCurrent(null);
      fetchQueue();
      onReviewed?.();
    }
  };

  return (
    <>
      <div className="my-4 p-4 bg-amber-500/[0.07] border border-amber-500/20 rounded-xl flex items-center justify-between">
        {" "}
        <div className="flex items-center gap-3">
          <span className="text-xl">📅</span>
          <div>
            <div className="text-sm font-semibold text-amber-300">
              {queue.length} problem{queue.length !== 1 ? "s" : ""} due for
              review
            </div>
            <div className="text-xs text-amber-600 mt-0.5">
              Spaced repetition keeps knowledge fresh — takes 2 minutes
            </div>
          </div>
        </div>
        <button
          onClick={handleOpen}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
        >
          Start Review →
        </button>
      </div>

      <ReviewModal
        problem={current}
        open={!!current}
        onClose={handleClose}
        onReviewed={handleReviewed}
      />
    </>
  );
}
