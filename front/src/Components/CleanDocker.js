import React, { Fragment } from 'react'
import get from 'lodash/get'
import bytes from 'bytes'
import SVG from './SVG'

class CleanDocker extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      clean: false,
      cleaned: {},
      socket: false, // is Loaded ?
    }
  }

  componentDidUpdate() {
    if (!this.props.socket || this.state.socket) {
      return
    }

    this.props.socket.on('prune', (cleaned) => {
      setTimeout(() => {
        this.setState({ clean: false, cleaned })
      }, 1000)
    })
  }

  componentDidMount() {
    if (!this.props.socket) {
      return
    }
    this.setState({ socket: true })
    this.props.socket.on('prune', (cleaned) => {
      setTimeout(() => {
        this.setState({ clean: false, cleaned })
      }, 1000)
    })
  }

  render() {
    const { socket } = this.props
    const { clean, cleaned } = this.state
    return (
      <Fragment>
        <button
          onClick={(e) => {
            socket.emit('prune')
            this.setState({ clean: true })
          }}
          className={`header__docker btn btn--rich ${clean && 'loading'}`}
          type="button"
        >
          <SVG icon="docker" />
          Clean docker
        </button>

        {cleaned && cleaned.containers && (
          <ul>
            <li>
              Deleted containers: {get(cleaned, 'containers.nb', '?')} (
              {bytes(get(cleaned, 'containers.go', 0))})
            </li>
            <li>
              Deleted images: {get(cleaned, 'images.nb', '?')} (
              {bytes(get(cleaned, 'images.go'))})
            </li>
          </ul>
        )}
      </Fragment>
    )
  }
}

export default CleanDocker
