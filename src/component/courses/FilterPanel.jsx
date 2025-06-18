import React from "react";
import { Form, Button } from "react-bootstrap";

const ageGroups = [
  "All Ages",
  "Teens (13-17)",
  "Young Adults (18-25)",
  "Parents & Guardians",
];
const topics = [
  "Substance Education",
  "Social Skills",
  "Mental Health",
  "Personal Development",
  "Family Support",
  "Digital Safety",
  "Crisis Support",
];
const levels = ["Beginner", "Intermediate", "Advanced", "All Levels"];

const FilterPanel = ({ filters, onFilterChange, onClearFilters }) => {
  const toggleTopic = (topic) => {
    const arr = filters.topics.includes(topic)
      ? filters.topics.filter((t) => t !== topic)
      : [...filters.topics, topic];
    onFilterChange({ topics: arr });
  };

  return (
    <div>
      <h5>Filter Courses</h5>
      <Form.Group className="mb-3">
        <Form.Label>Age Group</Form.Label>
        <Form.Select
          value={filters.ageGroup}
          onChange={(e) => onFilterChange({ ageGroup: e.target.value })}
        >
          {ageGroups.map((ag) => (
            <option key={ag}>{ag}</option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Topics</Form.Label>
        {topics.map((t) => (
          <Form.Check
            key={t}
            label={t}
            checked={filters.topics.includes(t)}
            onChange={() => toggleTopic(t)}
          />
        ))}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Level</Form.Label>
        <Form.Select
          value={filters.level}
          onChange={(e) => onFilterChange({ level: e.target.value })}
        >
          {levels.map((lv) => (
            <option key={lv}>{lv}</option>
          ))}
        </Form.Select>
      </Form.Group>

      <div className="d-flex">
        <Button variant="primary" className="me-2" onClick={onClearFilters}>
          Clear All
        </Button>
      </div>
    </div>
  );
};

export default FilterPanel;
