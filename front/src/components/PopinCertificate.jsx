import React, { Fragment } from 'react';
import SVG from './SVG';

class PopinCertificate extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      copied: false,
    };
  }

  clipboard(url) {
    navigator.clipboard.writeText(url);

    this.setState({ copied: true });

    setTimeout(() => {
      this.setState({ copied: false });
    }, 5000);
  }

  render() {
    const { active, toggleCertifPopin } = this.props;
    const { copied } = this.state;

    return (
      <>
        <div className={`certif-popin ${active && 'is-active'}`}>
          <div className="certif-popin__container">
            <div className="certif-popin__header">
              <h2 className="certif-popin__title">Certificate</h2>

              <button
                type="button"
                onClick={toggleCertifPopin}
                className="certif-popin__close"
              >
                <SVG icon="close" />
              </button>
            </div>

            <div className="text-center">
              <a
                className="certif-popin__download btn btn--secondary"
                href={new URL('/certificate', this.props.endpoint).href}
              >
                <SVG icon="download" extraClass="small-icon" />
                Download
              </a>
            </div>

            <span
              onClick={() => this.clipboard('chrome://settings/certificates')}
              className="label label--chrome"
            >
              <SVG icon="chrome" extraClass="small-icon" />
              chrome://settings/certificates
            </span>

            <span
              onClick={() => this.clipboard('about:preferences#privacy')}
              className="label label--firefox"
            >
              <SVG icon="firefox" extraClass="small-icon" />
              about:preferences#privacy
            </span>
          </div>
        </div>

        {copied && <div className="toast">Copied to clipboard</div>}
      </>
    );
  }
}

export default PopinCertificate;
