import SVGS from '../assets/svgs/svgs.json';

type Svg = {
  [index: string]: string;
};
const typedSvgs: Svg = SVGS;

type Props = {
  fill?: string;
  icon: string;
  width?: string | undefined;
  height?: string | undefined;
  display?: string | undefined;
  extraClass?: string | undefined;
};

type Style = {
  fill?: string;
  width?: string;
  height?: string;
  display?: string;
};

function SVG({
  fill, width, height, display, icon, extraClass,
}: Props) {
  const style: Style = {};

  if (fill) {
    style.fill = fill;
  }

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
      dangerouslySetInnerHTML={{ __html: typedSvgs[icon] }}
    />
  );
}

SVG.defaultProps = {
  fill: undefined,
  width: undefined,
  height: undefined,
  display: undefined,
  extraClass: undefined,
};

export default SVG;
