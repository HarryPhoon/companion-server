import React from 'react';
import {PropTypes} from 'react';
import {Link, IndexLink} from 'react-route-dom';

const Base = ({ children }) => (
  <div>
    <div className="top-bar">
      <div className="top-bar-left">
        <IndexLink to="/">React App</IndexLink>
      </div>

      <div className="top-bar-right">
        <Link to="/login">Log in</Link>
        <Link to="/signup">Sign up</Link>
      </div>
    </div>

    {children}

  </div>
);

Base.propTypes = {
  children: Proptypes.object.isRequired
};

export default Base;
