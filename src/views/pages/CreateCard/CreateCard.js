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
import { ref, set, push } from 'firebase/database'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { database, storage } from '../../../firebase'

const CreateCard = () => {
  const [street, setStreet] = useState('')
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
    if (!street || !description || !imageFile) {
      setError('Please fill all the fields and select an image.')
      return
    }

    setError('')

    try {
      const imageRef = storageRef(storage, `trashImages/${Date.now()}_${imageFile.name}`)
      await uploadBytes(imageRef, imageFile)
      const imageUrl = await getDownloadURL(imageRef)

      const cardData = {
        street,
        description,
        imageUrl,
      }

      const response = await createTrashCard(cardData)
      console.log('New trash card created:', response)

      // Очистить форму после успешного создания карточки
      setStreet('')
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
        <CCardHeader>Create Trash Card</CCardHeader>
        <CCardBody>
          {error && <div className="text-danger mb-3">{error}</div>}
          <CRow className="mb-3">
            <CCol md="3">
              <CFormLabel>Street</CFormLabel>
            </CCol>
            <CCol md="9">
              <CFormInput type="text" value={street} onChange={(e) => setStreet(e.target.value)} />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol md="3">
              <CFormLabel>Description</CFormLabel>
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
              <CFormLabel>Image</CFormLabel>
            </CCol>
            <CCol md="9">
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </CCol>
          </CRow>
          <CButton color="primary" onClick={handleCreateCard}>
            Create Card
          </CButton>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default CreateCard
