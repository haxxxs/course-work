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
import { database, storage } from '../../../firebase'
import { ref, onValue, set, get } from 'firebase/database'
import { getDownloadURL, ref as storageRef } from 'firebase/storage'

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null)
  const [cardsInProgress, setCardsInProgress] = useState([])

  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem('currentUser'))

    if (!userId) return

    const userRef = ref(database, `users/${userId}`)
    const trashCardsRef = ref(database, 'trashCards')

    onValue(userRef, async (snapshot) => {
      const profile = snapshot.val()
      setUserProfile(profile)

      const cards = []
      onValue(trashCardsRef, (snapshot) => {
        const items = snapshot.val()
        if (items) {
          const itemsArray = Object.keys(items).map((key) => ({
            id: key,
            ...items[key],
          }))
          itemsArray.forEach((item) => {
            if (item.creatorId === userId && item.status === 'in progress') {
              cards.push(item)
            }
          })
        }
        setCardsInProgress(cards)
      })
    })
  }, [])

  const handleConfirm = async (item) => {
    try {
      const cardRef = ref(database, `trashCards/${item.id}`)
      await set(cardRef, null)

      setCardsInProgress((prev) => prev.filter((card) => card.id !== item.id))
    } catch (error) {
      console.error('Error confirming trash item:', error)
    }
  }

  const handleReject = async (item) => {
    try {
      const cardRef = ref(database, `trashCards/${item.id}`)
      await set(cardRef, { ...item, status: 'available', takenBy: null })

      setCardsInProgress((prev) => prev.filter((card) => card.id !== item.id))
    } catch (error) {
      console.error('Error rejecting trash item:', error)
    }
  }

  return (
    <CContainer>
      <CCard>
        <CCardHeader>My Profile</CCardHeader>
        <CCardBody>
          {userProfile ? (
            <>
              <CRow>
                <CCol md="3">
                  <CFormLabel>Username</CFormLabel>
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
            <p>Loading profile...</p>
          )}
        </CCardBody>
      </CCard>

      <CCard>
        <CCardHeader>Cards in Progress</CCardHeader>
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
                <CCardFooter>
                  <CButton color="success" onClick={() => handleConfirm(card)}>
                    Confirm Completion
                  </CButton>
                  <CButton color="danger" onClick={() => handleReject(card)}>
                    Reject Completion
                  </CButton>
                </CCardFooter>
              </CCard>
            ))
          ) : (
            <p>No cards in progress.</p>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default Profile
