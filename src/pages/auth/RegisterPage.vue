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
        <input id="password" type="password" v-model="password" placeholder="Masukkan password" class="form-input"
          required />
      </div>
      <div class="form-group">
        <label for="confirm-password" class="form-label">Konfirmasi Password</label>
        <input id="confirm-password" type="password" v-model="confirmPassword" placeholder="Ulangi password"
          class="form-input" required />
      </div>
      <div class="register-actions">
        <button type="submit" class="register-button">Daftar</button>

        <p class="login-text">
          Sudah punya akun?
          <f7-link href="/login/" class="login-link">Masuk di sini</f7-link>
        </p>

        <f7-link href="/user/home/" class="back-link">Kembali ke Beranda</f7-link>
      </div>
    </form>

    <p v-if="error" class="error-message">{{ error }}</p>
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
      error: ''
    };
  },
  methods: {
    async registerUser() {
      this.error = '';

      // Validasi: Password dan konfirmasi harus sama
      if (this.password !== this.confirmPassword) {
        this.error = 'Password tidak cocok';
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
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
          this.error = data.message || 'Registrasi gagal';
          return;
        }

        f7.views.main.router.navigate('/login/');

      } catch (err) {
        this.error = 'Terjadi kesalahan saat registrasi.';
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
  margin-bottom: 0px;
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
  border-radius: 12px;
  padding: 12px;
  border: none;
  cursor: pointer;
}

.login-text {
  margin-top: 16px;
  font-size: 14px;
  color: #5a3c4c;
  text-align: center;
}

.login-link {
  color: #331c2c;
  font-weight: bold;
  margin-left: 4px;
}

.back-link {
  margin-top: 12px;
  font-size: 14px;
  color: #331c2c;
  text-decoration: underline;
}

.error-message {
  color: red;
  margin-top: 12px;
  text-align: center;
}
</style>