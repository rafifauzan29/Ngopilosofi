import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { f7 } from 'framework7-vue'
import { Preferences } from '@capacitor/preferences'

export const useCartStore = defineStore('cart', () => {
  const count = ref(0)
  const items = ref([])

  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => {
      return total + Number(item.totalPrice || 0)
    }, 0)
  })

  async function getToken() {
    const { value: token } = await Preferences.get({ key: 'token' })
    return token
  }

  async function updateCartItem(itemId, quantity, addons = []) {
    try {
      const token = await getToken()
      if (!token) return false

      const response = await fetch(`https://ngopilosofi-production.up.railway.app/api/cart/${itemId}`, {
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

      await Preferences.set({
        key: '/user/cart/',
        value: JSON.stringify(data.items)
      })

      return true
    } catch (error) {
      console.error('Error updating item:', error)
      return false
    }
  }

  async function bulkRemoveItems(itemIds) {
    try {
      const token = await getToken()
      if (!token) return false

      const response = await fetch('https://ngopilosofi-production.up.railway.app/api/cart/bulk-delete', {
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

      await Preferences.set({
        key: '/user/cart/',
        value: JSON.stringify(data.items)
      })

      return true
    } catch (error) {
      console.error('Error removing items:', error)
      return false
    }
  }

  function getQuantityByMenuId(menuItemId) {
    const item = items.value.find(i => {
      const id = typeof i.menuItem === 'object' ? i.menuItem._id : i.menuItem
      return id === menuItemId
    })
    return item ? item.quantity : 0
  }

  async function fetchCart() {
    try {
      const token = await getToken()
      if (!token) {
        count.value = 0
        items.value = []
        return
      }

      const response = await fetch('https://ngopilosofi-production.up.railway.app/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch cart')

      const data = await response.json()
      items.value = data.items || []
      count.value = totalItems.value

      await Preferences.set({
        key: '/user/cart/',
        value: JSON.stringify(data.items)
      })
    } catch (error) {
      console.error('Error fetching cart:', error)

      const { value: cachedCart } = await Preferences.get({ key: '/user/cart/' })
      if (cachedCart) {
        items.value = JSON.parse(cachedCart)
        count.value = totalItems.value
      }
    }
  }

  async function addToCart(menuItemId, quantity, addons = []) {
    try {
      const token = await getToken()
      if (!token) {
        f7.toast.create({
          text: 'Silakan login terlebih dahulu',
          closeTimeout: 3000,
          cssClass: 'error-toast',
        }).open()
        return false
      }

      const response = await fetch('https://ngopilosofi-production.up.railway.app/api/cart', {
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

      await Preferences.set({
        key: '/user/cart/',
        value: JSON.stringify(data.items)
      })

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
      const token = await getToken()
      if (!token) return false

      const response = await fetch(`https://ngopilosofi-production.up.railway.app/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to remove item')

      const data = await response.json()
      items.value = data.items
      count.value = totalItems.value

      await Preferences.set({
        key: '/user/cart/',
        value: JSON.stringify(data.items)
      })

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
    totalPrice,
    fetchCart,
    addToCart,
    removeFromCart,
    updateCartItem,
    bulkRemoveItems,
    getQuantityByMenuId
  }
})
