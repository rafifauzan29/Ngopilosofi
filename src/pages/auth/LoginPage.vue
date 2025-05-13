<template>
  <f7-page name="login" class="login-page">
    <!-- Header dengan logo -->
    <div class="login-header">
      <img src="../../logo.png" alt="Ngopilosofi Logo" class="login-logo" />
      <h1 class="login-title">Ngopilosofi</h1>
      <p class="login-subtitle">Masuk ke dunia ngopi penuh filosofi</p>
    </div>

    <!-- Form Login -->
    <form class="login-form">
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
    </form>

    <!-- Tombol Aksi -->
    <div class="login-actions">
      <f7-link href="/home/" class="button button-fill login-button">
        Login
      </f7-link>
      <p class="register-text">
        Belum punya akun?
        <f7-link href="/register/" class="register-link">Daftar Sekarang</f7-link>
      </p>
    </div>
  </f7-page>
</template>

<script>
export default {
  name: 'LoginPage',
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
}

.register-link {
  color: #331c2c;
  font-weight: bold;
  margin-left: 4px;
}
</style>
