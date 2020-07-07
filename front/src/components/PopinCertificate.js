import React from 'react'

const ENDPOINT = `https://girouette.devel`

class PopinCertificate extends React.Component {
  render() {
    const { active, toggleCertifPopin } = this.props

    return (
      <div className={`certif-popin ${active && 'is-active'}`}>
        <div className="certif-popin__container">
          <button onClick={ toggleCertifPopin }>Close</button>
          <br /><br />

          <a href={ENDPOINT.replace(/^https/, 'http') + '/certificate'} download>
            Download certificate
          </a>

          <ul>
            <li>Chrome: chrome://settings/certificates</li>
            <li>Firefox: about:preferences#privacy</li>
          </ul>
        </div>
      </div>
    )
  }
}

export default PopinCertificate
