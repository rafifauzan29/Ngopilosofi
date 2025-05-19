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
        <input id="password" type="password" v-model="password" placeholder="Masukkan password" class="form-input"
          required />
      </div>
      <div class="login-actions">
        <button type="submit" class="button button-fill login-button">
          Login
        </button>

        <p class="register-text">
          Belum punya akun?
          <f7-link href="/register/" class="register-link">Daftar Sekarang</f7-link>
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
  name: 'LoginPage',
  data() {
    return {
      email: '',
      password: '',
      error: ''
    };
  },
  methods: {
    async handleLogin() {
      this.error = '';

      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            f7.dialog.alert('Email atau kata sandi salah.', 'Login Gagal');
          } else {
            f7.dialog.alert(data.message || 'Login gagal.', 'Login Gagal');
          }
          return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        f7.dialog.alert('Login berhasil! Selamat datang.', 'Sukses', () => {
          f7.views.main.router.navigate('/user/home/');
        });

      } catch (err) {
        this.error = 'Terjadi kesalahan saat login.';
        console.error(err);
      }
    }
  },
  mounted() {
    const token = localStorage.getItem('token');
    if (token) {
      f7.views.main.router.navigate('/user/home/');
    }
  }
};

</script>

<style scoped>
.login-page {
  background-color: #ede0d1;
  padding: 20px 20px;
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
}

.back-link {
  margin-top: 12px;
  font-size: 14px;
  color: #331c2c;
  text-decoration: underline;
}
</style>