import React from 'react'

import Wait from '../wait.svg'

class CleanDns extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      dns: false,
      socket: false, // is Loaded ?
    }
  }

  componentDidUpdate() {
    if (!this.props.socket || this.state.socket) {
      return
    }

    this.props.socket.on('dns', (cleaned) => {
      setTimeout(() => {
        this.setState({ dns: false })
      }, 1000)
    })
  }

  componentDidMount() {
    if (!this.props.socket) {
      return
    }

    this.setState({ socket: true })
    this.props.socket.on('dns', (cleaned) => {
      this.setState({ dns: false })
    })
  }

  render() {
    const { socket } = this.props
    const { dns } = this.state
    return (
      <div>
        {!dns && (
          <button
            onClick={(e) => {
              socket.emit('dns')
              this.setState({ dns: true })
            }}
            type="button"
          >
            Clean dns
          </button>
        )}
        {dns && <img className="turn" width="30" src={Wait} alt="Clean" />}
      </div>
    )
  }
}

export default CleanDns
