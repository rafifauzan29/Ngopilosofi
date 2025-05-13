<template>
  <f7-page name="register" class="register-page">
    <!-- Header dengan logo -->
    <div class="register-header">
      <img src="../../logo.png" alt="Ngopilosofi Logo" class="register-logo" />
      <h1 class="register-title">Daftar Akun</h1>
      <p class="register-subtitle">Bergabung bersama Ngopilosofi</p>
    </div>

    <!-- Form Register -->
    <form class="register-form">
      <div class="form-group">
        <label for="name" class="form-label">Nama Lengkap</label>
        <input
          id="name"
          type="text"
          placeholder="Nama lengkap Anda"
          class="form-input"
          required
        />
      </div>
      <div class="form-group">
        <label for="email" class="form-label">Email</label>
        <input
          id="email"
          type="email"
          placeholder="email@anda.com"
          class="form-input"
          required
        />
      </div>
      <div class="form-group">
        <label for="password" class="form-label">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Masukkan password"
          class="form-input"
          required
        />
      </div>
      <div class="form-group">
        <label for="confirm-password" class="form-label">Konfirmasi Password</label>
        <input
          id="confirm-password"
          type="password"
          placeholder="Ulangi password"
          class="form-input"
          required
        />
      </div>
    </form>

    <!-- Tombol Aksi -->
    <div class="register-actions">
      <f7-link href="/home/" class="button button-fill register-button">
        Daftar
      </f7-link>
      <p class="login-text">
        Sudah punya akun?
        <f7-link href="/login/" class="login-link">Masuk di sini</f7-link>
      </p>
    </div>
  </f7-page>
</template>

<script>
export default {
  name: 'RegisterPage',
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
}

.login-text {
  margin-top: 16px;
  font-size: 14px;
  color: #5a3c4c;
}

.login-link {
  color: #331c2c;
  font-weight: bold;
  margin-left: 4px;
}
</style>
