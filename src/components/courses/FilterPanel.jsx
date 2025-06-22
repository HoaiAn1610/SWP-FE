import React from "react";
import "./FilterPanel.css";

const levels = ["All Levels", "Low", "Medium", "High"];
const categories = [
  "All Categories",
  "Health",
  "Science",
  "Personal Development",
  "Family Support",
  "Digital Safety",
  "Crisis Support",
];

const FilterPanel = ({ filters, onFilterChange, onClearFilters }) => (
  <div className="filter-panel">  
    <h5>Filter Courses</h5>

    <div className="section-title">Level</div>
    <ul>
      {levels.map((lv) => (
        <li
          key={lv}
          className={filters.level === lv ? "active" : ""}
          onClick={() => onFilterChange({ level: lv })}
        >
          {lv}
        </li>
      ))}
    </ul>

    <div className="divider" />

    <div className="section-title">Category</div>
    <ul>
      {categories.map((cat) => (
        <li
          key={cat}
          className={filters.category === cat ? "active" : ""}
          onClick={() => onFilterChange({ category: cat })}
        >
          {cat}
        </li>
      ))}
    </ul>

    <div className="divider" />

    <a href="#/" className="clear-btn" onClick={onClearFilters}>
      Clear All Filters
    </a>
  </div>
);

export default FilterPanel;
