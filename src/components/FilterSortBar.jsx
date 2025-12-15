import { useState } from "react";

export default function FilterSortBar({ onChange }) {
  const [genre, setGenre] = useState("all");
  const [sort, setSort] = useState("");

  const handleChange = (g, s) => {
    onChange(g, s);
  };

  return (
    <div className="filter-sort">
      {/* Genre Filter */}
      <select
        value={genre}
        onChange={(e) => {
          setGenre(e.target.value);
          handleChange(e.target.value, sort);
        }}
      >
        <option value="all">All Genres</option>
        <option value="fiction">Fiction</option>
        <option value="romance">Romance</option>
        <option value="mystery">Mystery</option>
        <option value="fantasy">Fantasy</option>
      </select>

      {/* Sort Options */}
      <select
        value={sort}
        onChange={(e) => {
          setSort(e.target.value);
          handleChange(genre, e.target.value);
        }}
      >
        <option value="">Sort By</option>
        <option value="genre-asc">Genre (A → Z)</option>
        <option value="genre-desc">Genre (Z → A)</option>
        <option value="read-price-low">Read Price: Low → High</option>
        <option value="read-price-high">Read Price: High → Low</option>
        <option value="buy-price-low">Buy Price: Low → High</option>
        <option value="buy-price-high">Buy Price: High → Low</option>
        <option value="title-asc">Title (A → Z)</option>
        <option value="title-desc">Title (Z → A)</option>
      </select>
    </div>
  );
}
