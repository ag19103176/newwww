import React from "react";
import editIcon from "../../assets/edit.png";
import deleteIcon from "../../assets/delete.png";
import "../Graph/toggle.css";
import "./card.css";

const ChartActions = ({ d, handleEdit, handleEditCount, handleDelete }) => {
  return (
    <>
      <div
        onClick={() =>
          d.chartBasic === "1" ? handleEdit(d) : handleEditCount(d)
        }
      >
        <img src={editIcon} alt="Edit Icon" className="source-icon" />
      </div>
      <div onClick={() => handleDelete(d._id)}>
        <img src={deleteIcon} alt="Delete Icon" className="source-icon" />
      </div>
    </>
  );
};

export default ChartActions;
