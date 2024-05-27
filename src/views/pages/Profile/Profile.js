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
} from '@coreui/react'
import axios from 'axios'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = JSON.parse(localStorage.getItem('currentUser'))
      if (!userId) {
        setError('User not found')
        return
      }

      try {
        const response = await axios.get(
          `https://6643c7556c6a656587084d66.mockapi.io/users/${userId}`,
        )
        setUser(response.data)
      } catch (err) {
        setError('Error fetching user data')
        console.error(err)
      }
    }

    fetchUserData()
  }, [])

  if (error) {
    return <div>{error}</div>
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <CContainer className="min-vh-100 d-flex flex-column align-items-center justify-content-center">
      <CRow className="justify-content-center">
        <CCol md={6}>
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
              {/* Добавьте другие поля по необходимости */}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Profile
