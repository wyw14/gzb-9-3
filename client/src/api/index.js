import axios from 'axios'
import { userStore } from '../store/user.js'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export function appendAuth(imageUrl) {
  if (!imageUrl) return imageUrl
  const sep = imageUrl.includes('?') ? '&' : '?'
  return imageUrl + sep + 'userId=' + userStore.user.id
}

export function getItems(userId) {
  return api.get('/items', { params: { userId } }).then(res => res.data)
}

export function getMyItems(userId) {
  return api.get('/items/my', { params: { userId } }).then(res => res.data)
}

export function getItemDetail(id, userId) {
  return api.get(`/items/${id}`, { params: { userId } }).then(res => res.data)
}

export function createItem(formData) {
  return api.post('/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data)
}

export function deleteItem(id, userId) {
  return api.delete(`/items/${id}`, { params: { userId } }).then(res => res.data)
}

export function createExchange(myItemId, targetItemId) {
  return api.post('/exchanges', { myItemId, targetItemId }).then(res => res.data)
}

export function getMyExchanges(userId) {
  return api.get('/exchanges/my', { params: { userId } }).then(res => res.data)
}

export function checkFavorite(itemId, userId) {
  return api.get(`/favorites/check/${itemId}`, { params: { userId } }).then(res => res.data)
}

export function addFavorite(itemId, userId) {
  return api.post(`/favorites/${itemId}`, { userId }).then(res => res.data)
}

export function removeFavorite(itemId, userId) {
  return api.delete(`/favorites/${itemId}`, { params: { userId } }).then(res => res.data)
}

export function getMyFavorites(userId) {
  return api.get('/favorites', { params: { userId } }).then(res => res.data)
}
