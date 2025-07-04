import React from "react";
import ActivityCard from "./ActivityCard";

export default function ActivityList({ activities, onSelect }) {
  if (!activities || activities.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        Không có hoạt động sắp tới.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
