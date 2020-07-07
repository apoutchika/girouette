import React from 'react';
import SVGS from '../assets/svgs/svgs.json';

const SVG = ( props ) => {
    let style = {
        fill: props.fill,
    }

    if (props.width) {
      style.width = props.width;
    }

    if (props.height) {
      style.height = props.height;
    }

    if (props.display) {
      style.display = props.display;
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1000 1000"
            className={`icon icon--${props.icon} ${(props.extraClass ? props.extraClass : '')}`}
            style={ style }
            dangerouslySetInnerHTML={{ __html: SVGS[props.icon] }}
        />
    );
};

export default SVG;
