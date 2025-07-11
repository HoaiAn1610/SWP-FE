import React from "react";
import "./FilterPanel.css";

// Danh sách mức độ (label và giá trị)
const levels = [
  { label: "Tất cả mức độ", value: "all" },
  { label: "Dễ", value: "Low" },
  { label: "Trung bình", value: "Medium" },
  { label: "Khó", value: "High" },
];

// Danh sách danh mục (label và giá trị)
const categories = [
  { label: "Tất cả danh mục", value: "all" },
  { label: "Nhận thức & Phòng ngừa", value: "Nhận thức & Phòng ngừa" },
  { label: "Lạm dụng thuốc kê đơn", value: "Lạm dụng thuốc kê đơn" },
  { label: "Ma túy bất hợp pháp & Giải trí", value: "Ma túy bất hợp pháp & Giải trí" },
  { label: "Chất tổng hợp & Hóa chất gia dụng", value: "Chất tổng hợp & Hóa chất gia dụng" },
  { label: "Rượu & Chất có cồn", value: "Rượu & Chất có cồn" },
  { label: "Sự thật về lạm dụng thuốc theo toa", value: "Sự thật về lạm dụng thuốc theo toa" },
];

const FilterPanel = ({ filters, onFilterChange, onClearFilters }) => {
  // Chuẩn hóa giá trị filters để so sánh
  const currentLevel = filters.level ? filters.level.toString().toLowerCase() : "all";
  const currentCategory = filters.category || "all";

  const handleLevelClick = (value) => {
    // Gộp với filters hiện tại để giữ bộ lọc danh mục
    onFilterChange({
      ...filters,
      level: value
    });
  };

  const handleCategoryClick = (value) => {
    // Gộp với filters hiện tại để giữ bộ lọc mức độ
    onFilterChange({
      ...filters,
      category: value
    });
  };

  return (
    <div className="filter-panel">
      <h5>Lọc khóa học</h5>

      <div className="section-title">Mức độ</div>
      <ul>
        {levels.map((lv) => (
          <li
            key={lv.value}
            className={currentLevel === lv.value.toLowerCase() ? "active" : ""}
            onClick={() => handleLevelClick(lv.value)}
          >
            {lv.label}
          </li>
        ))}
      </ul>

      <div className="divider" />

      <div className="section-title">Danh mục</div>
      <ul>
        {categories.map((cat) => (
          <li
            key={cat.value}
            className={currentCategory === cat.value ? "active" : ""}
            onClick={() => handleCategoryClick(cat.value)}
          >
            {cat.label}
          </li>
        ))}
      </ul>

      <div className="divider" />

      <button className="clear-btn" onClick={onClearFilters}>
        Xóa bộ lọc
      </button>
    </div>
  );
};

export default FilterPanel;
