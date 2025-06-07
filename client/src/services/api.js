import axios from 'axios';

const API = axios.create({
  baseURL: '/api', // will be proxied to backend
});

export const fetchSegments = () => API.get('/segments');
export const createSegment = (data) => API.post('/segments', data);
