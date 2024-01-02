import copy from "copy-to-clipboard";
import { useState } from "react";

import SVG from "./SVG";

type Props = {
  active: boolean;
  toggleCertifPopin: () => any;
  endpoint: string;
};

function PopinCertificate({ active, toggleCertifPopin, endpoint }: Props) {
  const [copied, setCopied] = useState<boolean>(false);

  const clipboard = (url: string) => {
    copy(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 5000);
  };

  return (
    <>
      <div className={`certif-popin ${active && "is-active"}`}>
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
              href={new URL("/certificate", endpoint).href}
            >
              <SVG icon="download" extraClass="small-icon" />
              Download
            </a>
          </div>

          <button
            type="button"
            onClick={() => clipboard("chrome://settings/certificates")}
            className="label label--chrome"
          >
            <SVG icon="chrome" extraClass="small-icon" />
            chrome://settings/certificates
          </button>

          <button
            type="button"
            onClick={() => clipboard("about:preferences#privacy")}
            className="label label--firefox"
          >
            <SVG icon="firefox" extraClass="small-icon" />
            about:preferences#privacy
          </button>
        </div>
      </div>

      {copied && <div className="toast">Copied to clipboard</div>}
    </>
  );
}

export default PopinCertificate;
