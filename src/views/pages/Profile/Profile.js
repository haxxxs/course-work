import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CRow,
  CFormInput,
  CFormLabel,
  CImage,
  CButton,
} from '@coreui/react'
import { database } from '../../../firebase'
import { ref, get } from 'firebase/database'
import styles from './Profile.module.scss'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = JSON.parse(localStorage.getItem('currentUser'))
      console.log('Fetched userId from localStorage:', userId)
      if (!userId) {
        setError('User not found')
        return
      }

      try {
        const userRef = ref(database, 'users/' + userId)
        console.log('Database reference:', userRef)
        const snapshot = await get(userRef)
        if (snapshot.exists()) {
          console.log('User data found:', snapshot.val())
          setUser(snapshot.val())
        } else {
          console.log('User data not found in database')
          setError('User data not found')
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
        setError('Error fetching user data')
      }
    }

    fetchUserData()
  }, [])

  const handleRemoveTrashItem = async (itemId) => {
    const userId = JSON.parse(localStorage.getItem('currentUser'))
    if (!userId) {
      alert('Please log in to remove items from your profile.')
      return
    }

    try {
      const userRef = ref(database, 'users/' + userId)
      const snapshot = await get(userRef)
      if (snapshot.exists()) {
        const userData = snapshot.val()
        const updatedTrashItems = userData.trashItems.filter((item) => item.id !== itemId)

        const updatedUser = {
          ...userData,
          trashItems: updatedTrashItems,
        }

        setUser(updatedUser)
        await set(userRef, updatedUser)
      } else {
        setError('User data not found')
      }
    } catch (error) {
      console.error('Error removing trash item from user profile:', error)
    }
  }

  if (error) {
    return <div>{error}</div>
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <CContainer
      className={`min-vh-100 d-flex flex-column align-items-center justify-content-center ${styles.profileContainer}`}
    >
      <CRow className="justify-content-center w-100">
        <CCol md={8}>
          <CCard>
            <CCardHeader>
              <h1>Профиль пользователя</h1>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormLabel>Имя пользователя</CFormLabel>
                </CCol>
                <CCol md={8}>
                  <CFormInput readOnly value={user.username} />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormLabel>Адрес</CFormLabel>
                </CCol>
                <CCol md={8}>
                  <CFormInput readOnly value={user.address} />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormLabel>Email</CFormLabel>
                </CCol>
                <CCol md={8}>
                  <CFormInput readOnly value={user.email} />
                </CCol>
              </CRow>
              <h2>Мусорные карточки</h2>
              {user.trashItems && user.trashItems.length > 0 ? (
                user.trashItems.map((item) => (
                  <CCard key={item.id} className="mb-3">
                    <CCardHeader>{item.street}</CCardHeader>
                    <CCardBody>
                      <CRow>
                        <CCol md="5">
                          <CImage src={item.imageUrl} alt="Trash" width="200px" />
                        </CCol>
                        <CCol md="5">
                          <p>{item.description}</p>
                        </CCol>
                      </CRow>
                    </CCardBody>
                    <CCardBody>
                      <CButton color="success" className="me-2">
                        Выполнено
                      </CButton>
                      <CButton color="danger" onClick={() => handleRemoveTrashItem(item.id)}>
                        Не выполнено
                      </CButton>
                    </CCardBody>
                  </CCard>
                ))
              ) : (
                <p>У вас нет добавленных мусорных карточек.</p>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Profile
