import SVG from './SVG';

type Props = {
  toggleCertifPopin: () => any;
};

function Header({ toggleCertifPopin }: Props) {
  return (
    <header className="header">
      <div className="header__logo">
        <img src="/logo.svg" alt="logo" />
        <h1>Girouette</h1>
      </div>

      <button
        type="button"
        className="header__certificate btn btn--reverse"
        onClick={toggleCertifPopin}
      >
        <SVG icon="key" extraClass="small-icon" />
        Certificate
      </button>
    </header>
  );
}

export default Header;
