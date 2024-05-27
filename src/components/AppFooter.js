import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="" target="_blank" rel="noopener noreferrer">
          Mibin
        </a>
        <span className="ms-1">&copy; 2024 хакатон.</span>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
