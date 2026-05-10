import axios from 'axios'

// Základní instance Axios — všechny požadavky míří na JSON Server běžící lokálně
export const api = axios.create({
  baseURL: 'http://localhost:3001',
})

// Ptáci
// Každý API objekt má stejnou strukturu: getAll, getById, create, update, delete
export const birdsApi = {
  getAll: () => api.get('/birds'),
  getById: (id) => api.get(`/birds/${id}`),
  create: (bird) => api.post('/birds', bird),
  update: (id, bird) => api.put(`/birds/${id}`, bird),
  delete: (id) => api.delete(`/birds/${id}`),
}

// Chovné páry
export const pairsApi = {
  getAll: () => api.get('/pairs'),
  getById: (id) => api.get(`/pairs/${id}`),
  create: (pair) => api.post('/pairs', pair),
  update: (id, pair) => api.put(`/pairs/${id}`, pair),
  delete: (id) => api.delete(`/pairs/${id}`),
}

// Voliéry
export const aviariesApi = {
  getAll: () => api.get('/aviaries'),
  getById: (id) => api.get(`/aviaries/${id}`),
  create: (aviary) => api.post('/aviaries', aviary),
  update: (id, aviary) => api.put(`/aviaries/${id}`, aviary),
  delete: (id) => api.delete(`/aviaries/${id}`),
}

// Záznamy o hnízdění
export const breedingApi = {
  getAll: () => api.get('/breedingRecords'),
  getById: (id) => api.get(`/breedingRecords/${id}`),
  create: (record) => api.post('/breedingRecords', record),
  update: (id, record) => api.put(`/breedingRecords/${id}`, record),
  delete: (id) => api.delete(`/breedingRecords/${id}`),
}

// Záznamy o krmení
export const feedingApi = {
  getAll: () => api.get('/feedingLogs'),
  getById: (id) => api.get(`/feedingLogs/${id}`),
  create: (log) => api.post('/feedingLogs', log),
  update: (id, log) => api.put(`/feedingLogs/${id}`, log),
  delete: (id) => api.delete(`/feedingLogs/${id}`),
}

// Zdravotní záznamy
export const healthApi = {
  getAll: () => api.get('/healthRecords'),
  getById: (id) => api.get(`/healthRecords/${id}`),
  create: (record) => api.post('/healthRecords', record),
  update: (id, record) => api.put(`/healthRecords/${id}`, record),
  delete: (id) => api.delete(`/healthRecords/${id}`),
}
