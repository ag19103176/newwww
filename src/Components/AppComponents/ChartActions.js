import React, { useState } from "react";
import editIcon from "../../assets/edit.png";
import deleteIcon from "../../assets/delete.png";
import "../Graph/toggle.css";
import "./card.css";

const ChartActions = ({ d, handleEdit, handleEditCount, handleDelete }) => {
  const [popUp, setpopup] = useState(false);
  const handlePopUp = () => {
    setpopup(true);
  };
  const hidePopUp = () => {
    setpopup(false);
  };
  return (
    <>
      <div
        onClick={() =>
          d.chartBasic === "1" ? handleEdit(d) : handleEditCount(d)
        }
      >
        <img src={editIcon} alt="Edit Icon" className="source-icon" />
      </div>
      <div onClick={handlePopUp}>
        <img src={deleteIcon} alt="Delete Icon" className="source-icon" />
      </div>
      {popUp && (
        <div className="box">
          <div className="modal-container">
            <div className="modal-content">
              <p>You sure you wanna delete?</p>
              <button className="cancel" onClick={hidePopUp}>
                Cancel
              </button>
              <button className="cancel" onClick={() => handleDelete(d._id)}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChartActions;
