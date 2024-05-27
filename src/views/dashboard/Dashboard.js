import React from 'react'
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
import styles from './Dashboard.module.scss'
import img1 from '../../assets/images/trash1.jpg'
import img2 from '../../assets/images/trash2.jpg'

const Dashboard = () => {
  const trashItems = [
    {
      id: 1,
      street: 'Улица Тархова 29',
      description: 'Мусор находится рядом с кфс.',
      imageUrl: img1,
    },
    {
      id: 2,
      street: '2nd Ave',
      description: 'Scattered trash near the bus stop.',
      imageUrl: img2,
    },
    // Добавьте больше элементов по необходимости
  ]

  const handleCleanUp = (id) => {
    console.log(`Trash item with id ${id} has been taken for cleanup.`)
    // Логика для обработки уборки мусора
  }

  return (
    <div className={styles['dashboard-container']}>
      {trashItems.map((item) => (
        <CCard key={item.id} className={styles['trash-card']}>
          <CCardHeader>{item.street}</CCardHeader>
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
            <CButton color="success" onClick={() => handleCleanUp(item.id)}>
              <CIcon icon={cilCheckCircle} className="me-2" />
              Забрать на уборку
            </CButton>
          </CCardFooter>
        </CCard>
      ))}
    </div>
  )
}

export default Dashboard
