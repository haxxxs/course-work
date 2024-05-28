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
  CCardFooter,
  CButton,
} from '@coreui/react'
import { database } from '../../../firebase'
import { ref, onValue, set } from 'firebase/database'

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null)
  const [cardsInProgress, setCardsInProgress] = useState([])
  const [cardsPendingVerification, setCardsPendingVerification] = useState([])

  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem('currentUser'))
    const storedUserProfile = JSON.parse(localStorage.getItem('userProfile'))

    if (!userId) return

    if (storedUserProfile) {
      setUserProfile(storedUserProfile)
    }

    const userRef = ref(database, `users/${userId}`)
    const trashCardsRef = ref(database, 'trashCards')

    onValue(userRef, (snapshot) => {
      const profile = snapshot.val()
      setUserProfile(profile)
    })

    onValue(trashCardsRef, (snapshot) => {
      const items = snapshot.val()
      if (items) {
        const itemsArray = Object.keys(items).map((key) => ({
          id: key,
          ...items[key],
        }))
        const inProgressCards = itemsArray.filter(
          (item) => item.takenBy === userId && item.status === 'in progress',
        )
        const pendingVerificationCards = itemsArray.filter(
          (item) => item.creatorId === userId && item.status === 'pending verification',
        )
        setCardsInProgress(inProgressCards)
        setCardsPendingVerification(pendingVerificationCards)
      } else {
        setCardsInProgress([])
        setCardsPendingVerification([])
      }
    })
  }, [])

  const handleConfirm = async (item) => {
    try {
      const cardRef = ref(database, `trashCards/${item.id}`)
      await set(cardRef, null)

      setCardsPendingVerification((prev) => prev.filter((card) => card.id !== item.id))
    } catch (error) {
      console.error('Error confirming trash item:', error)
    }
  }

  const handleReject = async (item) => {
    try {
      const cardRef = ref(database, `trashCards/${item.id}`)
      await set(cardRef, { ...item, status: 'available', takenBy: null })

      setCardsPendingVerification((prev) => prev.filter((card) => card.id !== item.id))
    } catch (error) {
      console.error('Error rejecting trash item:', error)
    }
  }

  return (
    <CContainer>
      <CCard>
        <CCardHeader>Мой профиль</CCardHeader>
        <CCardBody>
          {userProfile ? (
            <>
              <CRow>
                <CCol md="3">
                  <CFormLabel>Имя пользователя</CFormLabel>
                </CCol>
                <CCol md="9">
                  <CFormInput type="text" value={userProfile.username} readOnly />
                </CCol>
              </CRow>
              <CRow>
                <CCol md="3">
                  <CFormLabel>Email</CFormLabel>
                </CCol>
                <CCol md="9">
                  <CFormInput type="text" value={userProfile.email} readOnly />
                </CCol>
              </CRow>
            </>
          ) : (
            <p>Загрузга профиля...</p>
          )}
        </CCardBody>
      </CCard>

      <CCard>
        <CCardHeader>Текущие задачи</CCardHeader>
        <CCardBody>
          {cardsInProgress.length > 0 ? (
            cardsInProgress.map((card) => (
              <CCard key={card.id}>
                <CCardHeader>
                  <p>{card.street}</p>
                  <small>Created by: {card.createdBy}</small>
                </CCardHeader>
                <CCardBody>
                  <CRow>
                    <CCol md="3">
                      <CImage src={card.imageUrl} alt="Trash" width="200px" />
                    </CCol>
                    <CCol md="8">
                      <p>{card.description}</p>
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>
            ))
          ) : (
            <p>Нет текущих задач.</p>
          )}
        </CCardBody>
      </CCard>

      <CCard>
        <CCardHeader>Задачи ожидающие подтверждения</CCardHeader>
        <CCardBody>
          {cardsPendingVerification.length > 0 ? (
            cardsPendingVerification.map((card) => (
              <CCard key={card.id}>
                <CCardHeader>
                  <p>{card.street}</p>
                  <small>Created by: {card.createdBy}</small>
                </CCardHeader>
                <CCardBody>
                  <CRow>
                    <CCol md="3">
                      <CImage src={card.imageUrl} alt="Trash" width="200px" />
                    </CCol>
                    <CCol md="8">
                      <p>{card.description}</p>
                    </CCol>
                  </CRow>
                </CCardBody>
                <CCardFooter>
                  <CButton color="success" onClick={() => handleConfirm(card)}>
                    Подтвердить выполнение
                  </CButton>
                  <CButton color="danger" onClick={() => handleReject(card)}>
                    Отклонить выполнение
                  </CButton>
                </CCardFooter>
              </CCard>
            ))
          ) : (
            <p>Нет задач на ожидании подтверждения.</p>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default Profile
