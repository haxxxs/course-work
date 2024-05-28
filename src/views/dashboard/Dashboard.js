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
  CFormInput,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle } from '@coreui/icons'
import { database, storage } from '../../firebase'
import { ref, onValue, get, set } from 'firebase/database'
import { getDownloadURL, ref as storageRef } from 'firebase/storage'
import styles from './Dashboard.module.scss'

const Dashboard = () => {
  const [trashItems, setTrashItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const currentUser = JSON.parse(localStorage.getItem('currentUser'))

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
    if (!currentUser) {
      alert('Please log in to add items to your profile.')
      return
    }

    try {
      const cardRef = ref(database, `trashCards/${item.id}`)
      await set(cardRef, { ...item, status: 'in progress', takenBy: currentUser })

      alert('Trash item added to your profile.')
    } catch (error) {
      console.error('Error adding trash item to user profile:', error)
    }
  }

  const handleSubmitForVerification = async (item) => {
    try {
      const cardRef = ref(database, `trashCards/${item.id}`)
      await set(cardRef, { ...item, status: 'pending verification' })

      alert('Trash item submitted for verification.')
    } catch (error) {
      console.error('Error submitting trash item for verification:', error)
    }
  }

  const filteredTrashItems = trashItems.filter((item) =>
    `${item.country} ${item.city} ${item.street}`.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className={styles['dashboard-container']}>
      <div className="mb-3">
        <CFormInput
          type="text"
          placeholder="Поиск по локации..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {filteredTrashItems.map((item) => (
        <CCard key={item.id} className={styles['trash-card']}>
          <CCardHeader>
            <CRow>
              <CCol xs="3">
                <p>Страна: {item.country}</p>
              </CCol>
              <CCol xs="3">
                <p>Город: {item.city}</p>
              </CCol>
              <CCol xs="3">
                <p>Улица: {item.street}</p>
              </CCol>
              <CCol xs="3">
                <p>Дом: {item.house}</p>
              </CCol>
            </CRow>
            <br />
            <small>Создатель: {item.createdBy}</small>
          </CCardHeader>
          <CCardBody>
            <CRow className={styles['card-body-row']}>
              <CCol md="3">
                <CImage src={item.imageUrl} alt="Trash" width="200px" />
              </CCol>
              <CCol md="9" className={styles['card-description']}>
                <p>Описание: {item.description}</p>
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
            {item.status === 'in progress' && item.takenBy === currentUser && (
              <CButton color="primary" onClick={() => handleSubmitForVerification(item)}>
                Отправить на проверку
              </CButton>
            )}
            {item.status === 'pending verification' && <p>Ожидает подтверждения</p>}
            {item.status === 'in progress' && item.takenBy !== currentUser && (
              <p>Статус: В процессе</p>
            )}
          </CCardFooter>
        </CCard>
      ))}
    </div>
  )
}

export default Dashboard
