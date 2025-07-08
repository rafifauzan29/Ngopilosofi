<template>
  <f7-page name="register" class="register-page">
    <div class="register-header">
      <img src="../../logo.png" alt="Ngopilosofi Logo" class="register-logo" />
      <h1 class="register-title">Daftar Akun</h1>
      <p class="register-subtitle">Bergabung bersama Ngopilosofi</p>
    </div>

    <form class="register-form" @submit.prevent="registerUser">
      <div class="form-group">
        <label for="name" class="form-label">Nama Lengkap</label>
        <input id="name" type="text" v-model="name" placeholder="Nama lengkap Anda" class="form-input" required />
      </div>
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
          <button type="button" class="password-toggle" @click="togglePasswordVisibility('password')">
            <f7-icon :f7="showPassword ? 'eye_fill' : 'eye_slash_fill'" size="20"></f7-icon>
          </button>
        </div>
      </div>
      <div class="form-group">
        <label for="confirm-password" class="form-label">Konfirmasi Password</label>
        <div class="password-input-container">
          <input 
            id="confirm-password" 
            :type="showConfirmPassword ? 'text' : 'password'" 
            v-model="confirmPassword" 
            placeholder="Ulangi password" 
            class="form-input password-input" 
            required 
          />
          <button type="button" class="password-toggle" @click="togglePasswordVisibility('confirm')">
            <f7-icon :f7="showConfirmPassword ? 'eye_fill' : 'eye_slash_fill'" size="20"></f7-icon>
          </button>
        </div>
      </div>
      <div class="register-actions">
        <button type="submit" class="register-button">Daftar</button>

        <p class="login-text">
          Sudah punya akun?
          <f7-link href="/login/" class="login-link">Masuk di sini</f7-link>
        </p>
      </div>
    </form>
  </f7-page>
</template>

<script>
import { f7 } from 'framework7-vue';

export default {
  name: 'RegisterPage',
  data() {
    return {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      error: '',
      showPassword: false,
      showConfirmPassword: false
    };
  },
  methods: {
    togglePasswordVisibility(field) {
      if (field === 'password') {
        this.showPassword = !this.showPassword;
      } else {
        this.showConfirmPassword = !this.showConfirmPassword;
      }
    },
    async registerUser() {
      this.error = '';

      // Validasi form
      if (!this.name || !this.email || !this.password || !this.confirmPassword) {
        f7.dialog.alert('Harap lengkapi semua field.', 'Error');
        return;
      }

      if (this.password.length < 8) {
        f7.dialog.alert('Password harus terdiri dari minimal 8 karakter.', 'Error');
        return;
      }

      if (this.password !== this.confirmPassword) {
        f7.dialog.alert('Password dan konfirmasi password tidak cocok.', 'Error');
        return;
      }

      // Validasi email sederhana
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        f7.dialog.alert('Format email tidak valid.', 'Error');
        return;
      }

      try {
        const response = await fetch('https://ngopilosofi-production.up.railway.app/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: this.name,
            email: this.email,
            password: this.password,
            confirmPassword: this.confirmPassword
          })
        });

        let data;
        try {
          data = await response.json();
        } catch (parseErr) {
          const text = await response.text();
          data = { message: text };
        }

        if (!response.ok) {
          if (data.message && data.message.includes('email')) {
            f7.dialog.alert('Email sudah terdaftar. Silakan coba dengan email lain.', 'Error');
          } else {
            f7.dialog.alert(data.message || 'Registrasi gagal. Coba lagi.', 'Error');
          }
          return;
        }

        f7.dialog.alert('Registrasi berhasil! Silakan login.', 'Sukses', () => {
          f7.views.main.router.navigate('/login/');
        });

      } catch (err) {
        f7.dialog.alert('Terjadi kesalahan saat registrasi. Silakan coba lagi nanti.', 'Error');
        console.error('Error:', err);
      }
    }
  }
};
</script>

<style scoped>
.register-page {
  background-color: #ede0d1;
  padding: 20px 20px;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  justify-content: flex-start;
}

.register-header {
  text-align: center;
  margin-bottom: 20px;
}

.register-logo {
  width: 100px;
  height: 100px;
  margin-bottom: 12px;
  border-radius: 12px;
}

.register-title {
  font-size: 28px;
  font-weight: bold;
  color: #331c2c;
  margin: 0;
}

.register-subtitle {
  font-size: 15px;
  color: #5a3c4c;
  margin-top: 0px;
}

.register-form {
  margin-top: 0px;
}

.form-group {
  margin-bottom: 15px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: #5a3c4c;
  margin-bottom: 5px;
}

.form-input {
  width: 100%;
  background-color: white;
  padding: 12px;
  font-size: 16px;
  border: 2px solid #331c2c;
  border-radius: 10px;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  border-color: #5a3c4c;
  outline: none;
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

.register-actions {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.register-button {
  background-color: #331c2c;
  color: white;
  width: 100%;
  max-width: 320px;
  font-size: 16px;
  border-radius: 10px;
  padding: 14px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.register-button:hover {
  background-color: #5a3c4c;
}

.login-text {
  margin-top: 20px;
  font-size: 14px;
  color: #5a3c4c;
  text-align: center;
}

.login-link {
  color: #331c2c;
  font-weight: bold;
  margin-left: 4px;
  text-decoration: none;
}

@media (max-width: 480px) {
  .register-page {
    padding: 20px 15px;
  }
  
  .register-title {
    font-size: 24px;
  }
  
  .form-input {
    padding: 10px;
    font-size: 15px;
  }
}
</style>