import cn from 'classnames'
import includes from 'lodash/includes'
import map from 'lodash/map'
import React from 'react'
import FlipMove from 'react-flip-move'
import Chip from 'react-md/lib/Chips/Chip'
import Avatar from 'react-md/lib/Avatars/Avatar'
import FontIcon from 'react-md/lib/FontIcons/FontIcon'
import PropTypes from 'prop-types'

import config from './config'
import {Keys} from './keyCodes'

import './ChipsList.scss'


const deleteKeys = [
  Keys.BACKSPACE,
  Keys.DELETE,
]

export default class ChipsList extends React.Component {

  constructor() {
    super()

    // A hack to get around the fact that we can't cancel mouse events within a Chip (Chip is a Button, which doesn't
    //  allow for children handling clicks)
    // Right now this seems to be working without this hack...
    // this.didClickRemove = false
  }

  onClickChip = (chip, index, event) => {
    // console.log('onClickChip')
    // if (
    //   event.isPropagationStopped() ||
    //   event.isDefaultPrevented() ||
    //   this.didClickRemove
    // ) {
    //   this.didClickRemove = false
    //   return
    // }

    if (this.props.onClickChip) {
      this.props.onClickChip(chip.label, index, event)
    }
  }

  onKeyDownChip = (chip, index, event) => {
    if (this.props.onRemoveChip && includes(deleteKeys, event.key)) {
      // In some browsers the delete key goes back in history, so prevent that
      event.preventDefault()
      this.props.onRemoveChip(chip.label, index, event)
    }
  }

  onClickAvatar = (chip, index, event) => {
    event.stopPropagation()
    if (this.props.onClickAvatar) {
      this.props.onClickAvatar(chip.label, index, event)
    } else if (this.props.onClickChip) {
      this.props.onClickChip(chip.label, index, event)
    }
  }

  onClickRemove = (chip, index, event) => {
    // Currently has no effect because of react-md treating Chips as buttons, but it's what we are trying to do...
    event.stopPropagation()
    // So instead use this hack
    // this.didClickRemove = true
    // console.log('onClickRemove')
    if (this.props.onRemoveChip) {
      this.props.onRemoveChip(chip.label, index, event)
    } else if (this.props.onClickChip) {
      this.props.onClickChip(chip.label, index, event)
    }
  }

  render() {
    const {
      chips,
      extraChildren,
      removable,
      className,
      removeIconName,
      // ignore
      onClickAvatar,
      onRemoveChip,
      onClickChip,
      ...rest,
    } = this.props

    return (
      <FlipMove
        {...rest}
        {...config.ui.flipMove}
        className={cn(className, "chips-list")}
      >
        {map(chips, (chip, index) => {
          return (
            <Chip
              key={chip.label}
              label={chip.label}
              removable={removable}
              className={chip.className}
              iconClassName="remove-chip-icon"
              children={removable && (
                <FontIcon
                  className="chip-icon"
                  onClick={(event) => this.onClickRemove(chip, index, event)}
                >{removeIconName}</FontIcon>
              )}
              rotateIcon={false}
              onClick={(event) => this.onClickChip(chip, index, event)}
              onKeyDown={(event) => this.onKeyDownChip(chip, index, event)}
              avatar={(
                <Avatar
                  icon={<FontIcon className="chip-icon">thumb_up</FontIcon>}
                  onClick={(event) => this.onClickAvatar(chip, index, event)}
                />
              )}
            />
          )
        })}

        {extraChildren}
      </FlipMove>
    )
  }
}
ChipsList.propTypes = {
  chips: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    className: PropTypes.string,
  })),
  // Whether to show an icon for removing the chip.
  removable: PropTypes.bool,
  // Called when a user clicks a chip.  Not called if the the user clicked the remove icon.
  onClickChip: PropTypes.func,
  onClickAvatar: PropTypes.func,
  // called when a users removes a chip, either by pressing a delete key with it focused or by clicking the remove icon
  onRemoveChip: PropTypes.func,
  // components that will be inserted as siblings after the chips
  extraChildren: PropTypes.arrayOf(PropTypes.object),
}
ChipsList.defaultProps = {
  chips: [],
  removable: false,
}