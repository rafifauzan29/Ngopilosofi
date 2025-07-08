<template>
  <f7-page name="login" class="login-page">
    <div class="login-header">
      <img src="../../logo.png" alt="Ngopilosofi Logo" class="login-logo" />
      <h1 class="login-title">Ngopilosofi</h1>
      <p class="login-subtitle">Masuk ke dunia ngopi penuh filosofi</p>
    </div>

    <form class="login-form" @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email" class="form-label">Email</label>
        <input id="email" type="email" v-model="email" placeholder="email@anda.com" class="form-input" required />
      </div>
      <div class="form-group">
        <label for="password" class="form-label">Password</label>
        <div class="password-input-container">
          <input 
            id="password" 
            :type="showPassword ? 'text' : 'password'" 
            v-model="password" 
            placeholder="Masukkan password" 
            class="form-input password-input" 
            required 
          />
          <button type="button" class="password-toggle" @click="togglePasswordVisibility">
            <f7-icon :f7="showPassword ? 'eye_fill' : 'eye_slash_fill'" size="20"></f7-icon>
          </button>
        </div>
      </div>
      <div class="login-actions">
        <button type="submit" class="button button-fill login-button">Login</button>

        <p class="register-text">
          Belum punya akun?
          <f7-link href="/register/" class="register-link">Daftar Sekarang</f7-link>
        </p>
      </div>
    </form>
  </f7-page>
</template>

<script>
import { f7 } from 'framework7-vue'
import { Preferences } from '@capacitor/preferences'

export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      password: '',
      error: '',
      showPassword: false
    }
  },
  methods: {
    async handleLogin() {
      this.error = ''

      try {
        const response = await fetch('https://ngopilosofi-production.up.railway.app/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          if (response.status === 401) {
            f7.dialog.alert('Email atau kata sandi salah.', 'Login Gagal')
          } else {
            f7.dialog.alert(data.message || 'Login gagal.', 'Login Gagal')
          }
          return
        }

        await Preferences.set({ key: 'token', value: data.token })
        await Preferences.set({ key: 'user', value: JSON.stringify(data.user) })
        await Preferences.set({ key: 'userId', value: data.user._id })

        f7.dialog.alert('Login berhasil! Selamat datang.', 'Sukses', () => {
          f7.views.main.router.navigate('/user/home/')
        })

      } catch (err) {
        this.error = 'Terjadi kesalahan saat login.'
        console.error(err)
      }
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
    }
  },
  async mounted() {
    const { value: token } = await Preferences.get({ key: 'token' })
    if (token) {
      f7.views.main.router.navigate('/user/home/')
    }
  }
}
</script>

<style scoped>
.login-page {
  background-color: #ede0d1;
  padding: 100px 20px;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  justify-content: flex-start;
}

.login-header {
  text-align: center;
  margin-bottom: 0px;
}

.login-logo {
  width: 100px;
  height: 100px;
  margin-bottom: 12px;
  border-radius: 12px;
}

.login-title {
  font-size: 28px;
  font-weight: bold;
  color: #331c2c;
  margin: 0;
}

.login-subtitle {
  font-size: 15px;
  color: #5a3c4c;
  margin-top: 0px;
}

.login-form {
  margin-top: 0px;
}

.form-group {
  margin-bottom: 10px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: #5a3c4c;
}

.form-input {
  width: 100%;
  background-color: white;
  padding: 12px;
  font-size: 16px;
  border: 2px solid #331c2c;
  border-radius: 10px;
  margin-top: 6px;
  box-sizing: border-box;
}

.password-input-container {
  position: relative;
}

.password-input {
  padding-right: 40px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5a3c4c;
  cursor: pointer;
  outline: none;
}

.password-toggle i {
  font-size: 20px;
}

.login-actions {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-button {
  background-color: #331c2c;
  color: white;
  width: 100%;
  max-width: 320px;
  font-size: 16px;
  border-radius: 12px;
  padding: 12px;
  border: none;
}

.register-text {
  margin-top: 16px;
  font-size: 14px;
  color: #5a3c4c;
  text-align: center;
}

.register-link {
  color: #331c2c;
  font-weight: bold;
  margin-left: 4px;
  text-decoration: none;
}
</style>