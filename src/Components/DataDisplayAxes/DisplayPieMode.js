import React from "react";

const DisplayMode = ({
  handlelegendChange,
  handleTotalChange,
  legend,
  setTot,
  selectPercentage,
  setSelPer,
  selectSlicePercentage,
  setSlice,
}) => {
  const displayOptions = ["Off", "In legend", "On the chart"];
  return (
    <div className="display-section">
      <div className="displayy">
        <div className="legend">
          <label className="label">Show legend</label>
          <label className="switch">
            <input
              type="checkbox"
              checked={legend}
              onChange={(e) => handlelegendChange(e.target.checked)}
            />

            <span className="slider round"></span>
          </label>
        </div>
        <div className="legend">
          <label className="label">Show total</label>
          <label className="switch">
            <input
              type="checkbox"
              checked={setTot}
              onClick={(e) => handleTotalChange(e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
      <div>
        <div>
          <label>Select percentages</label>
        </div>
        <div>
          {displayOptions.map((option, index) => (
            // <div key={index}>
            //   <input
            //     type="radio"
            //     id={setSelPer}
            //     name="displayOption"
            //     value={option}
            //     checked={setSelPer === option}
            //     onChange={(e) => selectPercentage(e.target.value)}
            //   />
            //   <label>{option}</label>
            // </div>
            <div key={index} className="radio-button-wrapper">
              <input
                type="radio"
                id={index}
                name="displayOption"
                value={option}
                checked={setSelPer === option}
                onChange={(e) => selectPercentage(e.target.value)}
                className="radio-input"
              />
              <label
                htmlFor={index}
                className={`radio-label ${
                  setSelPer === option ? "active" : ""
                }`}
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div>
          <label>Minimum slice percentage</label>
        </div>
        <div>
          <input
            value={setSlice}
            onChange={(e) => selectSlicePercentage(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default DisplayMode;
