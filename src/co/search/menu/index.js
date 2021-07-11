import React, { useCallback } from 'react'

import Popover from '~co/overlay/popover'
import Options from './options'
import Suggestions from './suggestions'

export default function SearchMenu(props) {
    const { downshift: { getMenuProps, isOpen }, fieldRef, menuItemsCount=0 } = props

    //prevent the default handler behavior of downshift for some keypresses
    const onKeyDown = useCallback(e=>{
        switch(e.key) {
            case 'Enter':
            case 'Home':
            case 'End':
                e.nativeEvent.preventDownshiftDefault = true
                break
        }
    }, [])

    //prevent blur of input on click
    const onMouseDown = useCallback(e=>e.preventDefault(), [])

    return (
        <Popover 
            pin={fieldRef}
            stretch={true}
            hidden={!isOpen || !menuItemsCount}>
            <div {...getMenuProps({ onKeyDown, onMouseDown })}>
                {isOpen && (<>
                    <Options {...props} />
                    <Suggestions {...props} />
                </>)}
            </div>
        </Popover>
    )
}