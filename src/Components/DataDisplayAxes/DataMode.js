import React from "react";
import "./dataMode.css";

const DataMode = ({
  dimensions,
  measures,
  setDimen,
  setMea,
  handleDimensionChange,
  handleMeasureChange,
  type,
}) => {
  return (
    <div className="dim-container">
      <div className="column">
        <div className="dim">
          <label>{type === "1" ? "Dimension" : "X-axis"}</label>
          <select
            className="select-class"
            value={setDimen}
            onChange={(e) => handleDimensionChange(e.target.value)}
          >
            <option value="" className="option" disabled>
              Select a field
            </option>
            {dimensions.map((dim, index) => (
              <option key={index} value={dim}>
                {dim}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="column">
        <div className="dim">
          <label>{type === "1" ? "Measure" : "Y-axis"}</label>
          <select
            className="select-class"
            value={setMea}
            onChange={(e) => handleMeasureChange(e.target.value)}
          >
            <option value="" className="option" disabled>
              Select a field
            </option>
            {measures.map((measure, index) => (
              <option key={index} value={measure}>
                {measure}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default DataMode;
