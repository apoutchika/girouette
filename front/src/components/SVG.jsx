import React from 'react';
import SVGS from '../assets/svgs/svgs.json';

function SVG({
  fill, width, height, display, icon, extraClass,
}) {
  const style = {
    fill,
  };

  if (width) {
    style.width = width;
  }

  if (height) {
    style.height = height;
  }

  if (display) {
    style.display = display;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 1000"
      className={`icon icon--${icon} ${extraClass || ''}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: SVGS[icon] }}
    />
  );
}

export default SVG;
