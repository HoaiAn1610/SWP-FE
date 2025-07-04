import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ActivityList from "./ActivityList";
import api from "@/config/axios";

export default function FeaturedActivities() {
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/CommunicationActivities/Get-All-Activities")
      .then((res) => {
        const upcoming = res.data
          .filter((act) => new Date(act.eventDate) > new Date())
          .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
          .slice(0, 3);
        setActivities(upcoming);
      })
      .catch((err) => {
        console.error("Lỗi fetch activities:", err);
      });
  }, []);

  const handleSelect = (activity) => {
    navigate(`/activities/${activity.id}`);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-6">
          Hoạt động sắp tới
        </h2>

        <ActivityList activities={activities} onSelect={handleSelect} />

        <div className="flex justify-center mt-8">
          <Link
            to="/activities"
            className="
              inline-block
              bg-indigo-600 text-white
              px-8 py-3
              rounded-full
              hover:bg-indigo-700
              transition
            "
          >
            View All Activities
          </Link>
        </div>
      </div>
    </section>
  );
}
