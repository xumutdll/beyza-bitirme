import React from "react";
import { NavLink } from "react-router-dom";

const Filter: React.FC = () => {
  return (
    <NavLink end to="/">
      <div>Filter</div>
    </NavLink>
  );
};

export default Filter;
