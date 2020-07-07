import React, { Fragment } from 'react'
import SVG from './SVG'

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
      <Fragment>
        <button
          onClick={(e) => {
            socket.emit('dns')
            this.setState({ dns: true })
          }}
          className={`header__dns btn btn--rich ${dns && 'loading'}`}
          type="button"
        >
          <SVG icon="globe" extraClass="small-icon" />
          Clean dns
        </button>
      </Fragment>
    )
  }
}

export default CleanDns
