import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { f7 } from 'framework7-vue'

export const useCartStore = defineStore('cart', () => {
  const count = ref(0)
  const items = ref([])
  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

    async function updateCartItem(itemId, quantity, addons = []) {
    try {
      const token = localStorage.getItem('token')
      if (!token) return false
      
      const response = await fetch(`http://localhost:5000/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quantity,
          addons: addons.map(a => a._id)
        })
      })
      
      if (!response.ok) throw new Error('Failed to update item')
      
      const data = await response.json()
      items.value = data.items
      count.value = totalItems.value
      
      localStorage.setItem('/user/cart/', JSON.stringify(data.items))
      
      return true
    } catch (error) {
      console.error('Error updating item:', error)
      return false
    }
  }

  async function bulkRemoveItems(itemIds) {
    try {
      const token = localStorage.getItem('token')
      if (!token) return false
      
      const response = await fetch('http://localhost:5000/api/cart/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemIds })
      })
      
      if (!response.ok) throw new Error('Failed to remove items')
      
      const data = await response.json()
      items.value = data.items
      count.value = totalItems.value
      
      localStorage.setItem('/user/cart/', JSON.stringify(data.items))
      
      return true
    } catch (error) {
      console.error('Error removing items:', error)
      return false
    }
  }

  async function fetchCart() {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        count.value = 0
        items.value = []
        return
      }
      
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch cart')
      
      const data = await response.json()
      items.value = data.items || []
      count.value = totalItems.value
      
      localStorage.setItem('/user/cart/', JSON.stringify(data.items))
    } catch (error) {
      console.error('Error fetching cart:', error)
      const cachedCart = localStorage.getItem('/user/cart/')
      if (cachedCart) {
        items.value = JSON.parse(cachedCart)
        count.value = totalItems.value
      }
    }
  }

  async function addToCart(menuItemId, quantity, addons = []) {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        f7.toast.create({
          text: 'Silakan login terlebih dahulu',
          closeTimeout: 3000,
          cssClass: 'error-toast',
        }).open()
        return false
      }
      
      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          menuItemId,
          quantity,
          addons: addons.map(a => a._id)
        })
      })
      
      if (!response.ok) throw new Error('Failed to add to cart')
      
      const data = await response.json()
      items.value = data.items
      count.value = totalItems.value

      localStorage.setItem('/user/cart/', JSON.stringify(data.items))
      
      f7.toast.create({
        text: 'Produk ditambahkan ke keranjang',
        closeTimeout: 3000,
        cssClass: 'success-toast',
      }).open()
      
      return true
    } catch (error) {
      console.error('Error adding to cart:', error)
      f7.toast.create({
        text: 'Gagal menambahkan ke keranjang',
        closeTimeout: 3000,
        cssClass: 'error-toast',
      }).open()
      return false
    }
  }

  async function removeFromCart(itemId) {
    try {
      const token = localStorage.getItem('token')
      if (!token) return false
      
      const response = await fetch(`http://localhost:5000/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to remove item')
      
      const data = await response.json()
      items.value = data.items
      count.value = totalItems.value

      localStorage.setItem('/user/cart/', JSON.stringify(data.items))
      
      return true
    } catch (error) {
      console.error('Error removing item:', error)
      return false
    }
  }

  fetchCart()

  return {
    count,
    items,
    totalItems,
    fetchCart,
    addToCart,
    removeFromCart,
    updateCartItem,
    bulkRemoveItems
  }
})