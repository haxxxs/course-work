import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CRow,
  CFormInput,
  CFormLabel,
  CButton,
} from '@coreui/react'
import { ref, set, push, get } from 'firebase/database'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { database, storage } from '../../../firebase'

const CreateCard = () => {
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [street, setStreet] = useState('')
  const [house, setHouse] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [error, setError] = useState('')

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    setImageFile(file)
  }

  const createTrashCard = async (cardData) => {
    try {
      const newCardRef = push(ref(database, 'trashCards'))
      await set(newCardRef, cardData)
      console.log('New trash card created:', cardData)
      return cardData
    } catch (error) {
      console.error('Error creating trash card:', error)
      throw new Error('Error creating trash card')
    }
  }

  const handleCreateCard = async () => {
    if (!country || !city || !street || !description || !imageFile) {
      setError('Please fill all the fields and select an image.')
      return
    }

    setError('')

    try {
      const userId = JSON.parse(localStorage.getItem('currentUser'))
      if (!userId) {
        setError('User not found')
        return
      }

      const userRef = ref(database, 'users/' + userId)
      const userSnapshot = await get(userRef)
      if (!userSnapshot.exists()) {
        setError('User data not found')
        return
      }

      const userData = userSnapshot.val()
      const username = userData.username

      const imageRef = storageRef(storage, `trashImages/${Date.now()}_${imageFile.name}`)
      await uploadBytes(imageRef, imageFile)
      const imageUrl = await getDownloadURL(imageRef)

      const cardData = {
        country,
        city,
        street,
        house,
        description,
        imageUrl,
        createdBy: username,
        creatorId: userId,
        status: 'available',
        takenBy: null,
      }

      const response = await createTrashCard(cardData)
      console.log('New trash card created:', response)

      setCountry('')
      setCity('')
      setStreet('')
      setHouse('')
      setDescription('')
      setImageFile(null)
    } catch (error) {
      console.error('Error creating trash card:', error)
      setError('An error occurred while creating the trash card.')
    }
  }

  return (
    <CContainer>
      <CCard>
        <CCardHeader>Создать карточку с мусором</CCardHeader>
        <CCardBody>
          {error && <div className="text-danger mb-3">{error}</div>}
          <CRow className="mb-3">
            <CCol md="3">
              <CFormLabel>Страна</CFormLabel>
            </CCol>
            <CCol md="9">
              <CFormInput
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol md="3">
              <CFormLabel>Город</CFormLabel>
            </CCol>
            <CCol md="9">
              <CFormInput type="text" value={city} onChange={(e) => setCity(e.target.value)} />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol md="3">
              <CFormLabel>Улица</CFormLabel>
            </CCol>
            <CCol md="9">
              <CFormInput type="text" value={street} onChange={(e) => setStreet(e.target.value)} />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol md="3">
              <CFormLabel>Дом</CFormLabel>
            </CCol>
            <CCol md="9">
              <CFormInput type="text" value={house} onChange={(e) => setHouse(e.target.value)} />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol md="3">
              <CFormLabel>Описание</CFormLabel>
            </CCol>
            <CCol md="9">
              <CFormInput
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol md="3">
              <CFormLabel>Фотография</CFormLabel>
            </CCol>
            <CCol md="9">
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </CCol>
          </CRow>
          <CButton color="primary" onClick={handleCreateCard}>
            Создать
          </CButton>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default CreateCard
