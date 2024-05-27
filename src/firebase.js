import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyBKosR44HbhFDDyyc48IPFPbPbD9jlTpXk',
  authDomain: 'coursework-cada9.firebaseapp.com',
  projectId: 'coursework-cada9',
  storageBucket: 'coursework-cada9.appspot.com',
  messagingSenderId: '536277935825',
  appId: '1:536277935825:web:9562c12cb1daba9b8707f0',
  measurementId: 'G-418BPT7STW',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)
const database = getDatabase(app)
const storage = getStorage(app)

export { app, db, auth, database, storage }
