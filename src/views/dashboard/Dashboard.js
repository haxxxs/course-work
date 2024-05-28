import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardFooter,
  CButton,
  CCol,
  CRow,
  CImage,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle } from '@coreui/icons'
import { database, storage } from '../../firebase'
import { ref, onValue, get, set } from 'firebase/database'
import { getDownloadURL, ref as storageRef } from 'firebase/storage'
import styles from './Dashboard.module.scss'

const Dashboard = () => {
  const [trashItems, setTrashItems] = useState([])

  useEffect(() => {
    const fetchTrashItems = async () => {
      const trashCardsRef = ref(database, 'trashCards')
      onValue(trashCardsRef, async (snapshot) => {
        const items = snapshot.val()
        if (items) {
          const itemsArray = Object.keys(items).map((key) => ({
            id: key,
            ...items[key],
          }))

          // Fetch image URLs from storage
          const itemsWithImageUrls = await Promise.all(
            itemsArray.map(async (item) => {
              const imageUrl = await getDownloadURL(storageRef(storage, item.imageUrl))
              return { ...item, imageUrl }
            }),
          )

          setTrashItems(itemsWithImageUrls)
        }
      })
    }

    fetchTrashItems()
  }, [])

  const handleCleanUp = async (item) => {
    const userId = JSON.parse(localStorage.getItem('currentUser'))

    if (!userId) {
      alert('Please log in to add items to your profile.')
      return
    }

    try {
      const userRef = ref(database, `users/${userId}`)
      const userSnapshot = await get(userRef)

      if (userSnapshot.exists()) {
        const user = userSnapshot.val()
        const updatedUser = {
          ...user,
          trashItems: [...(user.trashItems || []), { ...item, status: 'pending' }],
        }

        await set(userRef, updatedUser)

        const cardRef = ref(database, `trashCards/${item.id}`)
        await set(cardRef, { ...item, status: 'in progress', takenBy: userId })

        alert('Trash item added to your profile.')
      } else {
        console.error('User not found.')
      }
    } catch (error) {
      console.error('Error adding trash item to user profile:', error)
    }
  }

  return (
    <div className={styles['dashboard-container']}>
      {trashItems.map((item) => (
        <CCard key={item.id} className={styles['trash-card']}>
          <CCardHeader>
            <p>{item.street}</p>
            <small>Created by: {item.createdBy}</small>
          </CCardHeader>
          <CCardBody>
            <CRow className={styles['card-body-row']}>
              <CCol md="3">
                <CImage src={item.imageUrl} alt="Trash" width="200px" />
              </CCol>
              <CCol md="8" className={styles['card-description']}>
                <p>{item.description}</p>
              </CCol>
            </CRow>
          </CCardBody>
          <CCardFooter>
            {item.status === 'available' && (
              <CButton color="success" onClick={() => handleCleanUp(item)}>
                <CIcon icon={cilCheckCircle} className="me-2" />
                Забрать на уборку
              </CButton>
            )}
            {item.status === 'in progress' && <p>In progress</p>}
          </CCardFooter>
        </CCard>
      ))}
    </div>
  )
}

export default Dashboard
